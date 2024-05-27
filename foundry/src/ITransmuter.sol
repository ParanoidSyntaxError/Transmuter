// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ITransmuterAdmin} from "./ITransmuterAdmin.sol";

interface ITransmuter is ITransmuterAdmin {
    enum CCIPReceiveType {
        Withdraw,
        Transmute
    }

    event TransmutationInitiated(address srcToken, uint64 destChain, address destToken, uint256 amount, address destReceiver);
    event TransmutationComplete();

    event Deposit(address srcToken, uint64 destChain, address destToken, uint256 amount, address depositor);
    event Withdraw(uint256 depositId, uint256 srcAmount, uint256 destAmount, address srcReceiver, address destReceiver);

    struct Epoch {
        uint256 amount;
        uint256 turnover;
        uint256 fees;
    }

    struct DepositParams {
        address srcToken;
        address destToken;
        uint64 destChain;
        uint256 amount;
    }

    struct DepositData {
        address srcToken;
        address destToken;
        uint64 destChain;
        uint256 amount;
        uint256 epochId;
        address owner;
    }

    struct WithdrawParams {
        uint256 depositId;
        address srcReceiver;
        address destReceiver;
        uint256 gasLimit;
        address feeToken;
    }

    struct WithdrawMessage {
        address token;
        uint256 amount;
        address receiver;
    }

    struct TransmuteParams {
        address srcToken;
        uint256 amount;
        address destToken;
        uint64 destChain;
        address destReceiver;
        address feeToken;
        uint256 gasLimit;
    }

    struct TransmuteMessage {
        address token;
        uint256 amount;
        address receiver;
    }

    function transmute(
        TransmuteParams memory params
    ) external payable returns (bytes32);

    function deposit(DepositParams memory params) external returns (uint256 depositId);
    function withdraw(WithdrawParams memory params) external returns (bytes32 requestId);
}
