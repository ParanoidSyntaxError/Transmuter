// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./ITransposerAdmin.sol";

contract TransposerAdmin is ITransposerAdmin {
    address private immutable _ccipRouter;
    uint64 private immutable _chainSelector;

    mapping(uint64 => address) private _ccipRouters;
    mapping(uint64 => address) private _transposers;

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

    function getTransposer(
        uint64 chain
    ) public view override returns (address) {
        return _transposers[chain];
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

    function setTransposers(
        uint64[] memory chains,
        address[] memory transposers
    ) external override {
        require(chains.length == transposers.length);

        for (uint256 i; i < transposers.length; i++) {
            _transposers[chains[i]] = transposers[i];
        }
    }
}
