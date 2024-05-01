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

    struct WithdrawParams {
        uint256 deposit;
        address depositReceiver;
        address withdrawReceiver;
        uint256 gasLimit;
        address feeToken;
    }

    struct WithdrawMessage {
        address outToken;
        uint256 amount;
        address receiver;
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
    
    // In chain => In token => Out token => Epoch ID => Tokens balances
    mapping(uint64 => mapping(address => mapping(address => mapping(uint256 => uint256)))) private _amounts;
    // In chain => In token => Out token => Epoch ID => Turnover
    mapping(uint64 => mapping(address => mapping(address => mapping(uint256 => uint256)))) private _turnovers;
    // In chain => In token => Out token => Epoch ID => Turnover
    mapping(uint64 => mapping(address => mapping(address => mapping(uint256 => uint256)))) private _rewards;
    // In chain => In token => Out token => Total epochs
    mapping(uint64 => mapping(address => mapping(address => uint256))) private _totalEpochs;

    uint256 private immutable _transposeFee;

    constructor(uint64 chain, address router, uint256 fee) CCIPReceiver(router) {
        _chainSelector = chain;
        _ccipRouter = router;

        _transposeFee = fee;
    }

    function _withdrawReward(uint256 depositId) internal view returns (uint256) {
        DepositData memory depo = _deposits[depositId];

        // TODO: Multiply to reduce division errors
        return (_amounts[_chainSelector][depo.inToken][depo.outToken][depo.epoch] / _rewards[_chainSelector][depo.inToken][depo.outToken][depo.epoch]) * depo.amount;
    }

    function deposit(DepositParams memory params) external returns (uint256) {
        IERC20(params.inToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        uint256 epochId = _totalEpochs[_chainSelector][params.inToken][params.outToken] + 1;

        _amounts[_chainSelector][params.inToken][params.outToken][epochId] += params.amount;

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

    function withdraw(WithdrawParams memory params) external returns (bytes32) {
        DepositData memory depo = _deposits[params.deposit];

        require(msg.sender == depo.depositor, "Sender is not depositor!");
        // Ends deposit
        _deposits[params.deposit].depositor = address(0);

        uint256 reward = _withdrawReward(params.deposit);
        uint256 withdrawAmount = depo.amount + reward;

        // TODO: Check if epoch has ended, if not withdraw correct ratio of deposited tokens

        // Encode withdraw message
        bytes memory messageData = abi.encode(
            CCIPReceiveCallback.Transpose,
            abi.encode(
                WithdrawMessage({
                    outToken: depo.outToken,
                    amount: withdrawAmount,
                    receiver: params.withdrawReceiver
                })
            )
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(address(0)), // TODO: Get cross chain withdrawal address
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

        // Send and return CCIP message ID
        return _ccipSend(depo.outChain, message);
    }

    function _receiveWithdraw(WithdrawMessage memory data) internal {
        IERC20(data.outToken).transfer(data.receiver, data.amount);
    }

    function transpose(
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

        // Send and return CCIP message ID
        return _ccipSend(params.outChain, message);
    }

    function _receiveTranspose(
        uint64 inChain,
        TranspositionMessage memory data
    ) internal {
        uint256 epochId = _totalEpochs[inChain][data.inToken][data.outToken];

        uint256 remainingTurnover = _amounts[inChain][data.inToken][data.outToken][epochId] - _turnovers[inChain][data.inToken][data.outToken][epochId];

        if(data.amount > remainingTurnover) {
            _turnovers[inChain][data.inToken][data.outToken][epochId] += remainingTurnover;
            // TODO: Multiply to reducing rounding errors
            _rewards[inChain][data.inToken][data.outToken][epochId] += (data.amount / data.fee) * remainingTurnover;

            _totalEpochs[inChain][data.inToken][data.outToken]++;
            epochId++;

            uint256 overflowingTurnover = data.amount - remainingTurnover;

            _turnovers[inChain][data.inToken][data.outToken][epochId] += overflowingTurnover;
            // TODO: Multiply to reducing rounding errors
            _rewards[inChain][data.inToken][data.outToken][epochId] += (data.amount / data.fee) * overflowingTurnover;
        } else {
            _turnovers[inChain][data.inToken][data.outToken][epochId] += data.amount;
            _rewards[inChain][data.inToken][data.outToken][epochId] += data.fee;
        }

        IERC20(data.outToken).transfer(data.receiver, data.amount);
    }

    function _ccipSend(uint64 outChain, Client.EVM2AnyMessage memory evm2AnyMessage) internal returns (bytes32) {
        IRouterClient router = IRouterClient(_ccipRouter);

        // Get CCIP fees
        uint256 ccipFee = router.getFee(outChain, evm2AnyMessage);

        if (evm2AnyMessage.feeToken == address(0)) {
            // Pay fee with native asset
            require(ccipFee <= msg.value, "Insufficient msg.value for CCIP fee!");
        } else {
            // Pay fee with ERC20
            IERC20(evm2AnyMessage.feeToken).transferFrom(
                msg.sender,
                address(this),
                ccipFee
            );
        }

        // Send and return CCIP message ID
        return router.ccipSend(outChain, evm2AnyMessage);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        // Decode CCIP receive callback type
        (CCIPReceiveCallback callback, bytes memory encodedData) = abi.decode(
            any2EvmMessage.data,
            (CCIPReceiveCallback, bytes)
        );

        if (callback == CCIPReceiveCallback.Withdraw) {
            WithdrawMessage memory data = abi.decode(
                encodedData,
                (WithdrawMessage)
            );

            _receiveWithdraw(data);
        }

        if (callback == CCIPReceiveCallback.Transpose) {
            // Decode transposition message
            TranspositionMessage memory data = abi.decode(
                encodedData,
                (TranspositionMessage)
            );

            _receiveTranspose(any2EvmMessage.sourceChainSelector, data);
        }
    }
}
