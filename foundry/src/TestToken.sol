// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("", "") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
