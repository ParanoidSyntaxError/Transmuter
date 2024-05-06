// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";

import {IRouterClient} from "@ccip/interfaces/IRouterClient.sol";
import {Client} from "@ccip/libraries/Client.sol";
import {CCIPReceiver} from "@ccip/applications/CCIPReceiver.sol";

contract Transposer_Epoch is CCIPReceiver {
    enum CCIPReceiveCallback {
        Withdraw,
        Transpose
    }

    struct Epoch {
        uint256 amount;
        uint256 turnover;
        uint256 fees;
    }

    struct DepositParams {
        address inToken;
        address outToken;
        uint64 outChain;
        uint256 amount;
    }

    struct Deposit {
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

    // Deposit ID => Deposit
    mapping(uint256 => Deposit) private _deposits;
    uint256 private _totalDeposits;
    
    // In chain => In token => Out token => Epoch ID => Epoch
    mapping(uint64 => mapping(address => mapping(address => mapping(uint256 => Epoch)))) private _epochs;
    // In chain => In token => Out token => Total epochs
    mapping(uint64 => mapping(address => mapping(address => uint256))) private _totalEpochs;

    uint256 private immutable _transposeFee;

    constructor(uint64 chain, address router, uint256 fee) CCIPReceiver(router) {
        _chainSelector = chain;
        _ccipRouter = router;

        _transposeFee = fee;
    }

    function _remainingTurnover(uint256 depositId) internal view returns (uint256) {
        Deposit memory depo = _deposits[depositId];
        Epoch memory epoch = _epochs[_chainSelector][depo.inToken][depo.outToken][depo.epoch];

        return epoch.amount - epoch.turnover;
    }

    function _withdrawReward(uint256 depositId) internal view returns (uint256) {
        Deposit memory depo = _deposits[depositId];
        Epoch memory epoch = _epochs[_chainSelector][depo.inToken][depo.outToken][depo.epoch];

        // TODO: Multiply to reduce division errors
        return (epoch.amount / epoch.fees) * depo.amount;
    }

    // TODO: Multiply to reduce division errors
    /*
    function _withdrawAmounts(uint256 depositId) internal view returns (uint256, uint256) {
        Deposit memory depo = _deposits[depositId];
        Epoch memory epoch = _epochs[_chainSelector][depo.inToken][depo.outToken][depo.epoch];

        uint256 reward = _withdrawReward(depositId);

        if(epoch.turnover >= epoch.amount) {
            return (0, depo.amount + reward);
        }

        return epoch.turnover / (epoch.amount / 100);
    }
    */

    function deposit(DepositParams memory params) external returns (uint256) {
        IERC20(params.inToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        uint256 epochId = _totalEpochs[_chainSelector][params.inToken][params.outToken] + 1;

        _epochs[_chainSelector][params.inToken][params.outToken][epochId].amount += params.amount;

        uint256 depositId = _totalDeposits;
        _totalDeposits++;

        _deposits[depositId] = Deposit({
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
        Deposit memory depo = _deposits[params.deposit];

        require(msg.sender == depo.depositor, "Sender is not depositor!");
        // Ends deposit
        _deposits[params.deposit].depositor = address(0);

        uint256 reward = _withdrawReward(params.deposit);
        uint256 withdrawAmount = depo.amount + reward;

        // TODO: Check if epoch has ended, if not withdraw correct ratio of deposited tokens
        //uint256 withdrawRatio = _withdrawRatio(params.deposit);

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

    // TODO: This function sucks
    function _receiveTranspose(
        uint64 inChain,
        TranspositionMessage memory data
    ) internal {
        uint256 epochId = _totalEpochs[inChain][data.inToken][data.outToken];

        uint256 remainingTurnover = _epochs[inChain][data.inToken][data.outToken][epochId].amount - _epochs[inChain][data.inToken][data.outToken][epochId].turnover;

        // TODO: Awful
        if(data.amount > remainingTurnover) {
            _epochs[inChain][data.inToken][data.outToken][epochId].turnover += remainingTurnover;
            // TODO: Multiply to reducing rounding errors
            _epochs[inChain][data.inToken][data.outToken][epochId].fees += (data.amount / data.fee) * remainingTurnover;

            _totalEpochs[inChain][data.inToken][data.outToken]++;
            epochId++;

            uint256 overflowingTurnover = data.amount - remainingTurnover;

            _epochs[inChain][data.inToken][data.outToken][epochId].turnover += overflowingTurnover;
            // TODO: Multiply to reducing rounding errors
            _epochs[inChain][data.inToken][data.outToken][epochId].fees += (data.amount / data.fee) * overflowingTurnover;
        } else {
            _epochs[inChain][data.inToken][data.outToken][epochId].turnover += data.amount;
            _epochs[inChain][data.inToken][data.outToken][epochId].fees += data.fee;
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
