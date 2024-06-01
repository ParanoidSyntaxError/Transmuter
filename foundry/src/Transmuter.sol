// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";

import {IRouterClient} from "@ccip/interfaces/IRouterClient.sol";
import {Client} from "@ccip/libraries/Client.sol";
import {CCIPReceiver} from "@ccip/applications/CCIPReceiver.sol";

import {TransmuterAdmin} from "./TransmuterAdmin.sol";
import {ITransmuter} from "./ITransmuter.sol";

contract Transmuter is ITransmuter, TransmuterAdmin, CCIPReceiver {
    // Deposit ID => Deposit
    mapping(uint256 => DepositData) private _deposits;
    uint256 private _totalDeposits;

    // In token => Out chain => Out token => Epoch ID => Epoch
    mapping(address => mapping(uint64 => mapping(address => mapping(uint256 => Epoch)))) private _epochs;
    // In token => Out chain => Out token => Total epochs
    mapping(address => mapping(uint64 => mapping(address => uint256))) private _totalEpochs;

    uint256 private constant TRANSMUTE_FEE = 1; // 0.1%

    uint256 private constant MATH_SCALE = 1000;

    constructor(
        uint64 chain,
        address router
    ) TransmuterAdmin(chain, router) CCIPReceiver(router) {}

    function transmuteFee() external pure returns (uint256) {
        return TRANSMUTE_FEE;
    }

    function totalDeposits() external view returns (uint256) {
        return _totalDeposits;
    }

    function epoch(address srcToken, uint64 destChain, address destToken, uint256 epochId) external view returns (Epoch memory) {
        return _epochs[srcToken][destChain][destToken][epochId];
    }

    function totalEpochs(address srcToken, uint64 destChain, address destToken) external view returns (uint256) {
        return _totalEpochs[srcToken][destChain][destToken];
    }

    function transmute(
        TransmuteParams memory params
    ) external payable override returns (bytes32 requestId) {
        IERC20(params.srcToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        // Encode transmute message
        bytes memory messageData = abi.encode(
            CCIPReceiveType.Transmute,
            abi.encode(
                TransmuteMessage({
                    srcToken: params.srcToken,
                    destToken: params.destToken,
                    amount: params.amount,
                    receiver: params.destReceiver
                })
            )
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(getTransmuter(params.destChain)),
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

        // Send CCIP message
        requestId = _ccipSend(params.destChain, message);

        emit Transmute(requestId, params.srcToken, params.destChain, params.destToken, params.amount, params.destReceiver);
    }

    function deposit(DepositParams memory params) external override returns (uint256 depositId) {
        IERC20(params.srcToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        uint256 depositEpoch = _depositEpochId(
            params.srcToken,
            params.destChain,
            params.destToken
        );

        // Update epoch
        _epochs[params.srcToken][params.destChain][params.destToken][depositEpoch].amount += params.amount;

        depositId = _totalDeposits;
        _totalDeposits++;

        _deposits[depositId] = DepositData({
            srcToken: params.srcToken,
            destToken: params.destToken,
            destChain: params.destChain,
            amount: params.amount,
            epochId: depositEpoch,
            owner: msg.sender
        });

        emit Deposit(depositId, params.srcToken, params.destChain, params.destToken, params.amount, msg.sender);
    }

    function withdraw(WithdrawParams memory params) external override returns (bytes32 requestId) {
        DepositData memory depo = _deposits[params.depositId];
        require(msg.sender == depo.owner, "Sender is not depositor!");

        // Ends deposit
        _deposits[params.depositId].owner = address(0);

        (uint256 srcAmount, uint256 destAmount) = _withdrawAmounts(depo);

        // If withdrawing before epoch ends deduct from epoch amount
        if (depo.epochId == _currentEpochId(depo.srcToken, depo.destChain, depo.destToken)) {
            _epochs[depo.srcToken][depo.destChain][depo.destToken][depo.epochId].amount -= depo.amount;
        }

        if (params.srcReceiver != address(0) || srcAmount == 0) {
            IERC20(depo.srcToken).transfer(params.srcReceiver, srcAmount);
        }

        if (params.destReceiver != address(0) && destAmount > 0) {
            // Encode withdraw message
            bytes memory messageData = abi.encode(
                CCIPReceiveType.Withdraw,
                abi.encode(
                    WithdrawMessage({
                        token: depo.destToken,
                        amount: destAmount,
                        receiver: params.destReceiver
                    })
                )
            );

            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(getTransmuter(depo.destChain)),
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
            requestId = _ccipSend(depo.destChain, message);
        }

        emit Withdraw(params.depositId, srcAmount, destAmount, params.srcReceiver, params.destReceiver, requestId);
    }

    function _currentEpochId(
        address srcToken,
        uint64 destChain,
        address destToken
    ) internal view returns (uint256) {
        return _totalEpochs[srcToken][destChain][destToken];
    }

    function _depositEpochId(
        address srcToken,
        uint64 destChain,
        address destToken
    ) internal view returns (uint256) {
        uint256 epochId = _currentEpochId(srcToken, destChain, destToken);
        Epoch memory epoc = _epochs[srcToken][destChain][destToken][epochId];

        if (epoc.turnover > 0 && 100 / (epoc.amount / epoc.turnover) >= 10) {
            return epochId + 1;
        }

        return epochId;
    }

    function _withdrawAmounts(
        DepositData memory depo
    ) internal view returns (uint256 srcAmount, uint256 destAmount) {
        uint256 currentEpochId = _currentEpochId(
            depo.srcToken,
            depo.destChain,
            depo.destToken
        );
        Epoch memory depoEpoch = _epochs[depo.srcToken][depo.destChain][depo.destToken][depo.epochId];

        if (depoEpoch.turnover >= depoEpoch.amount) {
            destAmount = depo.amount;
        } else {
            destAmount = (((depoEpoch.turnover * MATH_SCALE) / depoEpoch.amount) * depo.amount) / MATH_SCALE;
            srcAmount = depo.amount - destAmount;
        }

        if (currentEpochId > depo.epochId) {
            // Add fees earned
            destAmount += (((depoEpoch.fees * MATH_SCALE) / depoEpoch.amount) * depo.amount) / MATH_SCALE;
        }
    }

    function _ccipSend(
        uint64 outChain,
        Client.EVM2AnyMessage memory evm2AnyMessage
    ) internal returns (bytes32) {
        IRouterClient router = IRouterClient(ccipRouter());

        // Get CCIP fees
        uint256 ccipFee = router.getFee(outChain, evm2AnyMessage);

        if (evm2AnyMessage.feeToken == address(0)) {
            // Pay fee with native asset
            require(
                ccipFee <= msg.value,
                "Insufficient msg.value for CCIP fee!"
            );

            return router.ccipSend{value: ccipFee}(outChain, evm2AnyMessage);
        }

        // Pay fee with ERC20
        IERC20(evm2AnyMessage.feeToken).transferFrom(
            msg.sender,
            address(this),
            ccipFee
        );
        IERC20(evm2AnyMessage.feeToken).approve(ccipRouter(), ccipFee);

        return router.ccipSend(outChain, evm2AnyMessage);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        address sender = abi.decode(any2EvmMessage.sender, (address));
        require(sender == getTransmuter(any2EvmMessage.sourceChainSelector));

        // Decode CCIP receive callback type
        (CCIPReceiveType callback, bytes memory encodedData) = abi.decode(
            any2EvmMessage.data,
            (CCIPReceiveType, bytes)
        );

        if (callback == CCIPReceiveType.Withdraw) {
            WithdrawMessage memory data = abi.decode(
                encodedData,
                (WithdrawMessage)
            );

            _receiveWithdraw(data);
        }

        if (callback == CCIPReceiveType.Transmute) {
            // Decode transmutation message
            TransmuteMessage memory data = abi.decode(
                encodedData,
                (TransmuteMessage)
            );

            _receiveTransmute(data);
        }
    }

    function _receiveWithdraw(WithdrawMessage memory data) internal {
        IERC20(data.token).transfer(data.receiver, data.amount);
    }

    function _receiveTransmute(TransmuteMessage memory data) internal {
        uint256 fee = (data.amount / MATH_SCALE) * TRANSMUTE_FEE;
        uint256 destAmount = data.amount - fee;

        uint256 epochId = _currentEpochId(
            data.srcToken,
            chainSelector(),
            data.destToken
        );

        _epochs[data.srcToken][chainSelector()][data.destToken][epochId].turnover += destAmount;
        _epochs[data.srcToken][chainSelector()][data.destToken][epochId].fees += fee;
        
        Epoch memory epoc = _epochs[data.srcToken][chainSelector()][data.destToken][epochId];

        if (epoc.turnover >= epoc.amount) {
            _totalEpochs[data.srcToken][chainSelector()][data.destToken]++;
        }

        // TODO: Handle epoch rollover

        IERC20(data.destToken).transfer(data.receiver, destAmount);
    }
}