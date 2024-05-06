// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";

import {IRouterClient} from "@ccip/interfaces/IRouterClient.sol";
import {Client} from "@ccip/libraries/Client.sol";
import {CCIPReceiver} from "@ccip/applications/CCIPReceiver.sol";

import "./ITransposer.sol";

contract Transposer is ITransposer, CCIPReceiver {
    address private immutable _ccipRouter;
    uint64 private immutable _chainSelector;

    // Deposit ID => Deposit
    mapping(uint256 => Deposit) private _deposits;
    uint256 private _totalDeposits;
    
    // In chain => In token => Out token => Epoch ID => Epoch
    mapping(address => mapping(address => mapping(uint256 => Epoch))) private _epochs;
    // In chain => In token => Out token => Total epochs
    mapping(address => mapping(address => uint256)) private _totalEpochs;

    uint256 private immutable _transposeFee;

    constructor(uint64 chain, address router, uint256 fee) CCIPReceiver(router) {
        _chainSelector = chain;
        _ccipRouter = router;

        _transposeFee = fee;
    }

    function _currentEpochId(address srcToken, address destToken) internal view returns (uint256) {
        return _totalEpochs[srcToken][destToken];
    }

    function _depositEpochId(address srcToken, address destToken) internal view returns (uint256) {
        uint256 epochId = _currentEpochId(srcToken, destToken);
        Epoch memory epoch = _epochs[srcToken][destToken][epochId];

        if((epoch.turnover / epoch.amount) * 100 >= 10) {
            return epochId + 1;
        }

        return epochId;
    }

    // TODO
    function _updateEpoch() internal {

    }

    // TODO
    function _withdrawAmounts(Deposit memory depo) internal view returns (uint256, uint256) {
        if(depo.epochId == _currentEpochId(depo.srcToken, depo.destToken)) {
            // Do not return owed fees    
        }

        // Calculate src and dest token ratio, then add owed fees to dest amount
        return (0, 0);
    }

    function deposit(DepositParams memory params) external returns (uint256) {
        IERC20(params.srcToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        _updateEpoch();

        uint256 depositEpoch = _depositEpochId(params.srcToken, params.destToken);

        _epochs[params.srcToken][params.destToken][depositEpoch].amount += params.amount;

        uint256 depositId = _totalDeposits;
        _totalDeposits++;

        _deposits[depositId] = Deposit({
            srcToken: params.srcToken,
            destToken: params.destToken,
            destChain: params.destChain,
            amount: params.amount,
            epochId: depositEpoch,
            late: _currentEpochId(params.srcToken, params.destToken) == depositEpoch,
            owner: msg.sender
        });

        return depositId;
    }

    function withdraw(WithdrawParams memory params) external returns (bytes32) {
        Deposit memory depo = _deposits[params.depositId];
        require(msg.sender == depo.owner, "Sender is not depositor!");
        
        // Ends deposit
        _deposits[params.depositId].owner = address(0);

        _updateEpoch();

        (uint256 srcAmount, uint256 destAmount) = _withdrawAmounts(depo);

        // If withdrawing before epoch ends deduct from epoch amount
        if(depo.epochId == _currentEpochId(depo.srcToken, depo.destToken)) {
            _epochs[depo.srcToken][depo.destToken][depo.epochId].amount -= depo.amount;
        }

        if(params.srcReceiver != address(0) || srcAmount == 0) {
            IERC20(depo.srcToken).transfer(params.srcReceiver, srcAmount);
        }

        if(params.destReceiver != address(0) || destAmount == 0) {
            // Encode withdraw message
            bytes memory messageData = abi.encode(
                CCIPReceiveCallback.Transpose,
                abi.encode(
                    WithdrawMessage({
                        token: depo.destToken,
                        amount: destAmount,
                        receiver: params.destReceiver
                    })
                )
            );

            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(address(0)), // TODO: Get cross chain Transposer address
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
            return _ccipSend(depo.destChain, message);
        }

        return bytes32(0);
    }

    function _receiveWithdraw(WithdrawMessage memory data) internal {
        IERC20(data.token).transfer(data.receiver, data.amount);
    }

    function _ccipSend(uint64 outChain, Client.EVM2AnyMessage memory evm2AnyMessage) internal returns (bytes32) {
        IRouterClient router = IRouterClient(_ccipRouter);

        // Get CCIP fees
        uint256 ccipFee = router.getFee(outChain, evm2AnyMessage);

        if (evm2AnyMessage.feeToken == address(0)) {
            // Pay fee with native asset
            require(ccipFee <= msg.value, "Insufficient msg.value for CCIP fee!");

            return router.ccipSend{value: ccipFee}(outChain, evm2AnyMessage);
        }

        // Pay fee with ERC20
        IERC20(evm2AnyMessage.feeToken).transferFrom(
            msg.sender,
            address(this),
            ccipFee
        );
        IERC20(evm2AnyMessage.feeToken).approve(_ccipRouter, ccipFee);

        return router.ccipSend(outChain, evm2AnyMessage);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        // TODO: Chech sender is Transposer contract

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

    // TODO
    function transpose(
        TranspositionParams memory params
    ) external payable returns (bytes32) {
        
    }

    // TODO
    function _receiveTranspose(
        uint64 inChain,
        TranspositionMessage memory data
    ) internal {
        
    }
}