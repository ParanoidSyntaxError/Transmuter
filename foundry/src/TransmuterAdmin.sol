// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ITransmuterAdmin} from "./ITransmuterAdmin.sol";

contract TransmuterAdmin is ITransmuterAdmin {
    address private immutable _ccipRouter;
    uint64 private immutable _chainSelector;

    mapping(uint64 => address) private _ccipRouters;
    mapping(uint64 => address) private _transmuters;

    constructor(uint64 chain, address router) {
        _chainSelector = chain;
        _ccipRouter = router;
    }

    function chainSelector() public view override returns (uint64) {
        return _chainSelector;
    }

    function ccipRouter() public view override returns (address) {
        return _ccipRouter;
    }

    function getCcipRouter(
        uint64 chain
    ) public view override returns (address) {
        return _ccipRouters[chain];
    }

    function getTransmuter(
        uint64 chain
    ) public view override returns (address) {
        return _transmuters[chain];
    }

    function setCcipRouters(
        uint64[] memory chains,
        address[] memory routers
    ) external override {
        require(chains.length == routers.length);

        for (uint256 i; i < routers.length; i++) {
            _ccipRouters[chains[i]] = routers[i];
        }
    }

    function setTransmuters(
        uint64[] memory chains,
        address[] memory transmuters
    ) external override {
        require(chains.length == transmuters.length);

        for (uint256 i; i < transmuters.length; i++) {
            _transmuters[chains[i]] = transmuters[i];
        }
    }
}
