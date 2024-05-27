// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";

import "../src/TestToken.sol";
import "../src/Transmuter.sol";

contract TransmuterEnv is Test {
    Transmuter public transmuter;

    TestToken public testToken;

    function setUp() public {
        transmuter = new Transmuter(0, address(1));

        testToken = new TestToken();
    }
}