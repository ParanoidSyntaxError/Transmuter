// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0 ^0.8.20 ^0.8.25;

// lib/ccip/contracts/src/v0.8/ccip/libraries/Client.sol

// End consumer library.
library Client {
  /// @dev RMN depends on this struct, if changing, please notify the RMN maintainers.
  struct EVMTokenAmount {
    address token; // token address on the local chain.
    uint256 amount; // Amount of tokens.
  }

  struct Any2EVMMessage {
    bytes32 messageId; // MessageId corresponding to ccipSend on source.
    uint64 sourceChainSelector; // Source chain selector.
    bytes sender; // abi.decode(sender) if coming from an EVM chain.
    bytes data; // payload sent in original message.
    EVMTokenAmount[] destTokenAmounts; // Tokens and their amounts in their destination chain representation.
  }

  // If extraArgs is empty bytes, the default is 200k gas limit.
  struct EVM2AnyMessage {
    bytes receiver; // abi.encode(receiver address) for dest EVM chains
    bytes data; // Data payload
    EVMTokenAmount[] tokenAmounts; // Token transfers
    address feeToken; // Address of feeToken. address(0) means you will send msg.value.
    bytes extraArgs; // Populate this with _argsToBytes(EVMExtraArgsV1)
  }

  // bytes4(keccak256("CCIP EVMExtraArgsV1"));
  bytes4 public constant EVM_EXTRA_ARGS_V1_TAG = 0x97a657c9;

  struct EVMExtraArgsV1 {
    uint256 gasLimit;
    bool strict;
  }

  function _argsToBytes(EVMExtraArgsV1 memory extraArgs) internal pure returns (bytes memory bts) {
    return abi.encodeWithSelector(EVM_EXTRA_ARGS_V1_TAG, extraArgs);
  }
}

// lib/ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// src/ITransmuterAdmin.sol

interface ITransmuterAdmin {
    function chainSelector() external view returns (uint64);
    function ccipRouter() external view returns (address);

    function getCcipRouter(uint64 chain) external view returns (address);
    function getTransmuter(uint64 chain) external view returns (address);

    function setCcipRouters(
        uint64[] memory chains,
        address[] memory routers
    ) external;

    function setTransmuters(
        uint64[] memory chains,
        address[] memory transmuters
    ) external;
}

// lib/ccip/contracts/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol

/// @notice Application contracts that intend to receive messages from
/// the router should implement this interface.
interface IAny2EVMMessageReceiver {
  /// @notice Called by the Router to deliver a message.
  /// If this reverts, any token transfers also revert. The message
  /// will move to a FAILED state and become available for manual execution.
  /// @param message CCIP Message
  /// @dev Note ensure you check the msg.sender is the OffRampRouter
  function ccipReceive(Client.Any2EVMMessage calldata message) external;
}

// lib/ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol

interface IRouterClient {
  error UnsupportedDestinationChain(uint64 destChainSelector);
  error InsufficientFeeTokenAmount();
  error InvalidMsgValue();

  /// @notice Checks if the given chain ID is supported for sending/receiving.
  /// @param destChainSelector The chain to check.
  /// @return supported is true if it is supported, false if not.
  function isChainSupported(uint64 destChainSelector) external view returns (bool supported);

  /// @notice Gets a list of all tokens that have been configured through permissioned methods
  /// for the local chain. Do note that this list may not be exhaustive as some tokens may be
  /// supported permissionlessly. The list does not take the destChainSelector into account.
  /// @param destChainSelector No longer used.
  /// @return tokens The addresses of the tokens that are supported.
  function getSupportedTokens(uint64 destChainSelector) external view returns (address[] memory tokens);

  /// @param destinationChainSelector The destination chainSelector
  /// @param message The cross-chain CCIP message including data and/or tokens
  /// @return fee returns execution fee for the message
  /// delivery to destination chain, denominated in the feeToken specified in the message.
  /// @dev Reverts with appropriate reason upon invalid message.
  function getFee(
    uint64 destinationChainSelector,
    Client.EVM2AnyMessage memory message
  ) external view returns (uint256 fee);

  /// @notice Request a message to be sent to the destination chain
  /// @param destinationChainSelector The destination chain ID
  /// @param message The cross-chain CCIP message including data and/or tokens
  /// @return messageId The message ID
  /// @dev Note if msg.value is larger than the required fee (from getFee) we accept
  /// the overpayment with no refund.
  /// @dev Reverts with appropriate reason upon invalid message.
  function ccipSend(
    uint64 destinationChainSelector,
    Client.EVM2AnyMessage calldata message
  ) external payable returns (bytes32);
}

// src/ITransmuter.sol

interface ITransmuter is ITransmuterAdmin {
    enum CCIPReceiveType {
        Withdraw,
        Transmute
    }

    event Transmute(bytes32 requestId, address srcToken, uint64 destChain, address destToken, uint256 amount, address destReceiver);

    event Deposit(uint256 depositId, address srcToken, uint64 destChain, address destToken, uint256 amount, address depositor);
    event Withdraw(uint256 depositId, uint256 srcAmount, uint256 destAmount, address srcReceiver, address destReceiver, bytes32 requestId);

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

    struct DepositData {
        address srcToken;
        address destToken;
        uint64 destChain;
        uint256 amount;
        uint256 epochId;
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

    struct TransmuteParams {
        address srcToken;
        uint256 amount;
        address destToken;
        uint64 destChain;
        address destReceiver;
        address feeToken;
        uint256 gasLimit;
    }

    struct TransmuteMessage {
        address srcToken;
        address destToken;
        uint256 amount;
        address receiver;
    }

    function transmute(
        TransmuteParams memory params
    ) external payable returns (bytes32 requestId);

    function deposit(DepositParams memory params) external returns (uint256 depositId);
    function withdraw(WithdrawParams memory params) external returns (bytes32 requestId);
}

// src/TransmuterAdmin.sol

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

// lib/ccip/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol

/// @title CCIPReceiver - Base contract for CCIP applications that can receive messages.
abstract contract CCIPReceiver is IAny2EVMMessageReceiver, IERC165 {
  address internal immutable i_ccipRouter;

  constructor(address router) {
    if (router == address(0)) revert InvalidRouter(address(0));
    i_ccipRouter = router;
  }

  /// @notice IERC165 supports an interfaceId
  /// @param interfaceId The interfaceId to check
  /// @return true if the interfaceId is supported
  /// @dev Should indicate whether the contract implements IAny2EVMMessageReceiver
  /// e.g. return interfaceId == type(IAny2EVMMessageReceiver).interfaceId || interfaceId == type(IERC165).interfaceId
  /// This allows CCIP to check if ccipReceive is available before calling it.
  /// If this returns false or reverts, only tokens are transferred to the receiver.
  /// If this returns true, tokens are transferred and ccipReceive is called atomically.
  /// Additionally, if the receiver address does not have code associated with
  /// it at the time of execution (EXTCODESIZE returns 0), only tokens will be transferred.
  function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
    return interfaceId == type(IAny2EVMMessageReceiver).interfaceId || interfaceId == type(IERC165).interfaceId;
  }

  /// @inheritdoc IAny2EVMMessageReceiver
  function ccipReceive(Client.Any2EVMMessage calldata message) external virtual override onlyRouter {
    _ccipReceive(message);
  }

  /// @notice Override this function in your implementation.
  /// @param message Any2EVMMessage
  function _ccipReceive(Client.Any2EVMMessage memory message) internal virtual;

  /////////////////////////////////////////////////////////////////////
  // Plumbing
  /////////////////////////////////////////////////////////////////////

  /// @notice Return the current router
  /// @return CCIP router address
  function getRouter() public view returns (address) {
    return address(i_ccipRouter);
  }

  error InvalidRouter(address router);

  /// @dev only calls from the set router are accepted.
  modifier onlyRouter() {
    if (msg.sender != address(i_ccipRouter)) revert InvalidRouter(msg.sender);
    _;
  }
}

// src/Transmuter.sol

contract Transmuter is ITransmuter, TransmuterAdmin, CCIPReceiver {
    // Deposit ID => Deposit
    mapping(uint256 => DepositData) private _deposits;
    uint256 private _totalDeposits;

    // In token => Out chain => Out token => Epoch ID => Epoch
    mapping(address => mapping(uint64 => mapping(address => mapping(uint256 => Epoch)))) private _epochs;
    // In token => Out chain => Out token => Total epochs
    mapping(address => mapping(uint64 => mapping(address => uint256))) private _totalEpochs;

    uint256 private constant TRANSMUTE_FEE = 1; // 0.1%

    uint256 private constant MATH_SCALE = 1000;

    constructor(
        uint64 chain,
        address router
    ) TransmuterAdmin(chain, router) CCIPReceiver(router) {}

    function transmuteFee() external pure returns (uint256) {
        return TRANSMUTE_FEE;
    }

    function totalDeposits() external view returns (uint256) {
        return _totalDeposits;
    }

    function epoch(address srcToken, uint64 destChain, address destToken, uint256 epochId) external view returns (Epoch memory) {
        return _epochs[srcToken][destChain][destToken][epochId];
    }

    function totalEpochs(address srcToken, uint64 destChain, address destToken) external view returns (uint256) {
        return _totalEpochs[srcToken][destChain][destToken];
    }

    function transmute(
        TransmuteParams memory params
    ) external payable override returns (bytes32 requestId) {
        IERC20(params.srcToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        // Encode transmute message
        bytes memory messageData = abi.encode(
            CCIPReceiveType.Transmute,
            abi.encode(
                TransmuteMessage({
                    srcToken: params.srcToken,
                    destToken: params.destToken,
                    amount: params.amount,
                    receiver: params.destReceiver
                })
            )
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(getTransmuter(params.destChain)),
            data: messageData,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({
                    gasLimit: params.gasLimit,
                    strict: false
                })
            ),
            feeToken: params.feeToken
        });

        // Send CCIP message
        requestId = _ccipSend(params.destChain, message);

        emit Transmute(requestId, params.srcToken, params.destChain, params.destToken, params.amount, params.destReceiver);
    }

    function deposit(DepositParams memory params) external override returns (uint256 depositId) {
        IERC20(params.srcToken).transferFrom(
            msg.sender,
            address(this),
            params.amount
        );

        uint256 depositEpoch = _depositEpochId(
            params.srcToken,
            params.destChain,
            params.destToken
        );

        // Update epoch
        _epochs[params.srcToken][params.destChain][params.destToken][depositEpoch].amount += params.amount;

        depositId = _totalDeposits;
        _totalDeposits++;

        _deposits[depositId] = DepositData({
            srcToken: params.srcToken,
            destToken: params.destToken,
            destChain: params.destChain,
            amount: params.amount,
            epochId: depositEpoch,
            owner: msg.sender
        });

        emit Deposit(depositId, params.srcToken, params.destChain, params.destToken, params.amount, msg.sender);
    }

    function withdraw(WithdrawParams memory params) external override returns (bytes32 requestId) {
        DepositData memory depo = _deposits[params.depositId];
        require(msg.sender == depo.owner, "Sender is not depositor!");

        // Ends deposit
        _deposits[params.depositId].owner = address(0);

        (uint256 srcAmount, uint256 destAmount) = _withdrawAmounts(depo);

        // If withdrawing before epoch ends deduct from epoch amount
        if (depo.epochId == _currentEpochId(depo.srcToken, depo.destChain, depo.destToken)) {
            _epochs[depo.srcToken][depo.destChain][depo.destToken][depo.epochId].amount -= depo.amount;
        }

        if (params.srcReceiver != address(0) || srcAmount == 0) {
            IERC20(depo.srcToken).transfer(params.srcReceiver, srcAmount);
        }

        if (params.destReceiver != address(0) && destAmount > 0) {
            // Encode withdraw message
            bytes memory messageData = abi.encode(
                CCIPReceiveType.Withdraw,
                abi.encode(
                    WithdrawMessage({
                        token: depo.destToken,
                        amount: destAmount,
                        receiver: params.destReceiver
                    })
                )
            );

            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(getTransmuter(depo.destChain)),
                data: messageData,
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({
                        gasLimit: params.gasLimit,
                        strict: false
                    })
                ),
                feeToken: params.feeToken
            });

            // Send and return CCIP message ID
            requestId = _ccipSend(depo.destChain, message);
        }

        emit Withdraw(params.depositId, srcAmount, destAmount, params.srcReceiver, params.destReceiver, requestId);
    }

    function _currentEpochId(
        address srcToken,
        uint64 destChain,
        address destToken
    ) internal view returns (uint256) {
        return _totalEpochs[srcToken][destChain][destToken];
    }

    function _depositEpochId(
        address srcToken,
        uint64 destChain,
        address destToken
    ) internal view returns (uint256) {
        uint256 epochId = _currentEpochId(srcToken, destChain, destToken);
        Epoch memory epoc = _epochs[srcToken][destChain][destToken][epochId];

        if (epoc.turnover > 0 && 100 / (epoc.amount / epoc.turnover) >= 10) {
            return epochId + 1;
        }

        return epochId;
    }

    function _withdrawAmounts(
        DepositData memory depo
    ) internal view returns (uint256 srcAmount, uint256 destAmount) {
        uint256 currentEpochId = _currentEpochId(
            depo.srcToken,
            depo.destChain,
            depo.destToken
        );
        Epoch memory depoEpoch = _epochs[depo.srcToken][depo.destChain][depo.destToken][depo.epochId];

        if (depoEpoch.turnover >= depoEpoch.amount) {
            destAmount = depo.amount;
        } else {
            destAmount = (((depoEpoch.turnover * MATH_SCALE) / depoEpoch.amount) * depo.amount) / MATH_SCALE;
            srcAmount = depo.amount - destAmount;
        }

        if (currentEpochId > depo.epochId) {
            // Add fees earned
            destAmount += (((depoEpoch.fees * MATH_SCALE) / depoEpoch.amount) * depo.amount) / MATH_SCALE;
        }
    }

    function _ccipSend(
        uint64 outChain,
        Client.EVM2AnyMessage memory evm2AnyMessage
    ) internal returns (bytes32) {
        IRouterClient router = IRouterClient(ccipRouter());

        // Get CCIP fees
        uint256 ccipFee = router.getFee(outChain, evm2AnyMessage);

        if (evm2AnyMessage.feeToken == address(0)) {
            // Pay fee with native asset
            require(
                ccipFee <= msg.value,
                "Insufficient msg.value for CCIP fee!"
            );

            return router.ccipSend{value: ccipFee}(outChain, evm2AnyMessage);
        }

        // Pay fee with ERC20
        IERC20(evm2AnyMessage.feeToken).transferFrom(
            msg.sender,
            address(this),
            ccipFee
        );
        IERC20(evm2AnyMessage.feeToken).approve(ccipRouter(), ccipFee);

        return router.ccipSend(outChain, evm2AnyMessage);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        address sender = abi.decode(any2EvmMessage.sender, (address));
        require(sender == getTransmuter(any2EvmMessage.sourceChainSelector));

        // Decode CCIP receive callback type
        (CCIPReceiveType callback, bytes memory encodedData) = abi.decode(
            any2EvmMessage.data,
            (CCIPReceiveType, bytes)
        );

        if (callback == CCIPReceiveType.Withdraw) {
            WithdrawMessage memory data = abi.decode(
                encodedData,
                (WithdrawMessage)
            );

            _receiveWithdraw(data);
        }

        if (callback == CCIPReceiveType.Transmute) {
            // Decode transmutation message
            TransmuteMessage memory data = abi.decode(
                encodedData,
                (TransmuteMessage)
            );

            _receiveTransmute(data);
        }
    }

    function _receiveWithdraw(WithdrawMessage memory data) internal {
        IERC20(data.token).transfer(data.receiver, data.amount);
    }

    function _receiveTransmute(TransmuteMessage memory data) internal {
        uint256 fee = (data.amount / MATH_SCALE) * TRANSMUTE_FEE;
        uint256 destAmount = data.amount - fee;

        uint256 epochId = _currentEpochId(
            data.srcToken,
            chainSelector(),
            data.destToken
        );

        _epochs[data.srcToken][chainSelector()][data.destToken][epochId].turnover += destAmount;
        _epochs[data.srcToken][chainSelector()][data.destToken][epochId].fees += fee;
        
        Epoch memory epoc = _epochs[data.srcToken][chainSelector()][data.destToken][epochId];

        if (epoc.turnover >= epoc.amount) {
            _totalEpochs[data.srcToken][chainSelector()][data.destToken]++;
        }

        // TODO: Handle epoch rollover

        IERC20(data.destToken).transfer(data.receiver, destAmount);
    }
}
