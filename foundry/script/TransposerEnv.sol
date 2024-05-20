// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "forge-std/Test.sol";

import "../src/TestToken.sol";
import "../src/Transposer.sol";

contract TransposerEnv is Test {
    Transposer public transposer;

    TestToken public testToken;

    function setUp() public {
        transposer = new Transposer(0, address(1));

        testToken = new TestToken();
    }
}