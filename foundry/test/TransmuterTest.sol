// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "../script/TransmuterEnv.sol";

import "../src/ITransmuter.sol";

contract TransmuterTest is TransmuterEnv {
    function test_deposit() public {
        testToken.mint(address(this), 1000);
        testToken.approve(address(transmuter), 1000);

        ITransmuter.DepositParams memory depositParams = ITransmuter.DepositParams({
            srcToken: address(testToken),
            destToken: address(1),
            destChain: 1,
            amount: 100
        });

        uint256 depositId = transmuter.deposit(depositParams);
        
        /*
        ITransmuter.TransmuteParams memory transmuteParams = ITransmuter.TransmuteParams({
            srcToken: address(testToken),
            amount: 10,
            destToken: address(1),
            destChain: 777,
            destReceiver: address(this),
            feeToken: address(1),
            gasLimit: 3000000
        });

        transmuter.transmute(transmuteParams);
        */

        ITransmuter.WithdrawParams memory withdrawParams = ITransmuter.WithdrawParams({
            depositId: depositId,
            srcReceiver: address(this),
            destReceiver: address(0),
            gasLimit: 3000000,
            feeToken: address(1)
        });

        transmuter.withdraw(withdrawParams);
    }
}