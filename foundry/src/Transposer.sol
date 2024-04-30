// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";

import {IRouterClient} from "@ccip/interfaces/IRouterClient.sol";
import {Client} from "@ccip/libraries/Client.sol";
import {CCIPReceiver} from "@ccip/applications/CCIPReceiver.sol";

contract Transposer is CCIPReceiver {
    enum CCIPReceiveCallback {
        Withdraw,
        Transpose
    }

    struct DepositParams {
        address inToken;
        address outToken;
        uint64 outChain;
        uint256 amount;
    }

    struct DepositData {
        address inToken;
        address outToken;
        uint64 outChain;
        uint256 amount;
        address depositor;
        uint256 epoch;
    }

    struct TranspositionParams {
        address inToken;
        address outToken;
        uint64 outChain;
        uint256 amount;
        address receiver;
        uint256 gasLimit;
        address feeToken;
    }

    struct TranspositionMessage {
        address inToken;
        address outToken;
        uint256 amount;
        uint256 fee;
        address receiver;
    }

    uint64 private immutable _chainSelector;

    address private immutable _ccipRouter;

    // Deposit ID => Deposit data
    mapping(uint256 => DepositData) private _deposits;
    uint256 private _totalDeposits;
    
    // In chain => In token => Out token => Tokens balances
    mapping(uint64 => mapping(address => mapping(address => mapping(uint256 => uint256)))) private _epochAmounts;
    // In chain => In token => Out token => Epoch ID => Turnover
    mapping(uint64 => mapping(address => mapping(address => mapping(uint256 => uint256)))) private _epochTurnover;
    // In chain => In token => Out token => Epoch ID => Turnover
    mapping(uint64 => mapping(address => mapping(address => mapping(uint256 => uint256)))) private _epochRewards;
    // In chain => In token => Out token => Total epochs
    mapping(uint64 => mapping(address => mapping(address => uint256))) private _totalEpochs;

    uint256 private immutable _transposeFee;

    constructor(uint64 chain, address router, uint256 fee) CCIPReceiver(router) {
        _chainSelector = chain;
        _ccipRouter = router;

        _transposeFee = fee;
    }

    function deposit(DepositParams memory params) external returns (uint256) {
        IERC20(params.inToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        uint256 epochId = _totalEpochs[_chainSelector][params.inToken][params.outToken] + 1;

        _epochAmounts[_chainSelector][params.inToken][params.outToken][epochId] += params.amount;

        uint256 depositId = _totalDeposits;
        _totalDeposits++;

        _deposits[depositId] = DepositData({
            inToken: params.inToken,
            outToken: params.outToken,
            outChain: params.outChain,
            amount: params.amount,
            depositor: msg.sender,
            epoch: epochId
        });

        return depositId;
    }

    function withdraw(uint256 depositId, address depositReceiver, address withdrawReciver) external {
        require(msg.sender == _deposits[depositId].depositor, "Sender is not depositor!");

        // (epochAmount / rewards) * principle
    }

    function startTransposing(
        TranspositionParams memory params
    ) external payable returns (bytes32) {
        IERC20(params.inToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        uint256 transposeFee = params.amount / _transposeFee;

        // Encode transposition data
        bytes memory messageData = abi.encode(
            CCIPReceiveCallback.Transpose,
            abi.encode(
                TranspositionMessage({
                    inToken: params.inToken,
                    outToken: params.outToken,
                    amount: params.amount - transposeFee,
                    fee: transposeFee,
                    receiver: params.receiver
                })
            )
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(address(0)), // TODO: Get cross chain transposer address
            data: messageData,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({
                    gasLimit: params.gasLimit,
                    strict: false
                })
            ),
            feeToken: params.feeToken
        });

        IRouterClient router = IRouterClient(_ccipRouter);

        // Get CCIP fees
        uint256 ccipFee = router.getFee(params.outChain, message);

        if (params.feeToken == address(0)) {
            // Pay fee with native asset
            require(ccipFee <= msg.value, "Insufficient msg.value for CCIP fee!");
        } else {
            // Pay fee with ERC20
            IERC20(params.feeToken).transferFrom(
                msg.sender,
                address(this),
                ccipFee
            );
        }

        // Send and return CCIP message ID
        return router.ccipSend(params.outChain, message);
    }

    function _finishTransposing(
        TranspositionMessage memory data,
        uint64 inChain
    ) internal {
        uint256 epochId = _totalEpochs[inChain][data.inToken][data.outToken];

        uint256 remainingTurnover = _epochAmounts[inChain][data.inToken][data.outToken][epochId] - _epochTurnover[inChain][data.inToken][data.outToken][epochId];

        if(data.amount > remainingTurnover) {
            _epochTurnover[inChain][data.inToken][data.outToken][epochId] += remainingTurnover;
            // TODO: Multiply to reducing rounding errors
            _epochRewards[inChain][data.inToken][data.outToken][epochId] += (data.amount / data.fee) * remainingTurnover;

            _totalEpochs[inChain][data.inToken][data.outToken]++;
            epochId++;

            uint256 overflowingTurnover = data.amount - remainingTurnover;

            _epochTurnover[inChain][data.inToken][data.outToken][epochId] += overflowingTurnover;
            // TODO: Multiply to reducing rounding errors
            _epochRewards[inChain][data.inToken][data.outToken][epochId] += (data.amount / data.fee) * overflowingTurnover;
        } else {
            _epochTurnover[inChain][data.inToken][data.outToken][epochId] += data.amount;
            _epochRewards[inChain][data.inToken][data.outToken][epochId] += data.fee;
        }

        IERC20(data.outToken).transfer(data.receiver, data.amount);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        // Decode CCIP receive callback type
        (CCIPReceiveCallback callback, bytes memory encodedData) = abi.decode(
            any2EvmMessage.data,
            (CCIPReceiveCallback, bytes)
        );

        if (callback == CCIPReceiveCallback.Withdraw) {}

        if (callback == CCIPReceiveCallback.Transpose) {
            // Decode transposition data
            TranspositionMessage memory data = abi.decode(
                encodedData,
                (TranspositionMessage)
            );

            _finishTransposing(data, any2EvmMessage.sourceChainSelector);
        }
    }
}
