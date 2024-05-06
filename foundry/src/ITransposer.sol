// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface ITransposer {
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
}