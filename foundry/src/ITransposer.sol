// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./ITransposerAdmin.sol";

interface ITransposer is ITransposerAdmin {
    enum CCIPReceiveType {
        Withdraw,
        Transpose
    }

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

    struct Deposit {
        address srcToken;
        address destToken;
        uint64 destChain;
        uint256 amount;
        uint256 epochId;
        bool late;
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
}
