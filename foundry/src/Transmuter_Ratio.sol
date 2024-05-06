// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/token/ERC20/IERC20.sol";

import {IRouterClient} from "@ccip/interfaces/IRouterClient.sol";
import {Client} from "@ccip/libraries/Client.sol";
import {CCIPReceiver} from "@ccip/applications/CCIPReceiver.sol";

contract Transmuter_Ratio is CCIPReceiver {
    struct Pool {
        uint256 amount;
        uint256 fees;
    }

    struct Deposit {
        address srcToken;
        uint64 destChain;
        address destToken;
        uint256 principle;
        uint256 startingPoolAmount;
    }

    uint64 private immutable _chainSelector;

    address private immutable _ccipRouter;

    uint256 private immutable _baseFee;

    // Source token => Destination chain selector => Destination token => Pool
    mapping(address => mapping(uint64 => mapping(address => Pool))) internal _pools;

    // Source token => Destination chain selector => Destination token => Pool
    mapping(address => mapping(uint64 => mapping(address => mapping(uint256 => Deposit)))) internal _deposits;

    constructor(uint64 chain, address router, uint256 fee) CCIPReceiver(router) {
        _chainSelector = chain;
        _ccipRouter = router;

        _baseFee = fee;
    }

    function _ccipSend(uint64 outChain, Client.EVM2AnyMessage memory evm2AnyMessage) internal returns (bytes32) {
        IRouterClient router = IRouterClient(_ccipRouter);

        // Get CCIP fees
        uint256 ccipFee = router.getFee(outChain, evm2AnyMessage);

        if (evm2AnyMessage.feeToken == address(0)) {
            // Pay fee with native asset
            require(ccipFee <= msg.value, "Insufficient msg.value for CCIP fee!");
        } else {
            // Pay fee with ERC20
            IERC20(evm2AnyMessage.feeToken).transferFrom(
                msg.sender,
                address(this),
                ccipFee
            );
        }

        // Send and return CCIP message ID
        return router.ccipSend(outChain, evm2AnyMessage);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        
    }
}
