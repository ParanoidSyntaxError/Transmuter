// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "../script/TransposerEnv.sol";

import "../src/ITransposer.sol";

contract GermzTest is TransposerEnv {
    function test_deposit() public {
        testToken.mint(address(this), 1000);
        testToken.approve(address(transposer), 1000);

        ITransposer.DepositParams memory depositParams = ITransposer.DepositParams({
            srcToken: address(testToken),
            destToken: address(1),
            destChain: 1,
            amount: 100
        });

        transposer.deposit(depositParams);

        ITransposer.TransposeParams memory transposeParams = ITransposer.TransposeParams({
            srcToken: address(testToken),
            amount: 10,
            destToken: address(1),
            destChain: 777,
            destReceiver: address(this),
            feeToken: address(1),
            gasLimit: 3000000
        });

        transposer.transpose(transposeParams);

        ITransposer.WithdrawParams memory withdrawParams = ITransposer.WithdrawParams({
            depositId: 0,
            srcReceiver: address(this),
            destReceiver: address(this),
            gasLimit: 3000000,
            feeToken: address(1)
        });

        transposer.withdraw(withdrawParams);
    }
}