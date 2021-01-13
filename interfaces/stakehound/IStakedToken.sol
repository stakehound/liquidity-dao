// contracts/StakedToken.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

interface IStakedToken {
    /**
     * @dev Emitted when supply controller is changed
     */
    event LogSupplyControllerUpdated(address supplyController);
    /**
     * @dev Emitted when token distribution happens
     */
    event LogTokenDistribution(uint256 oldTotalSupply, uint256 supplyChange, bool positive, uint256 newTotalSupply);
    /**
     * @dev Emitted if total supply exceeds maximum expected supply
     */
    event WarningMaxExpectedSupplyExceeded(uint256 totalSupply, uint256 totalShares);

    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5,05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless {_setupDecimals} is
     * called.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() external view returns (uint8);

    /**
     * @return The total supply of the underlying token
     */
    function totalSupply() external view returns (uint256);

    /**
     * @return The total supply in shares
     */
    function totalShares() external view returns (uint256);

    /**
     * @return The supply controller
     */
    function supplyController() external view returns (address);

    /**
     * @param who The address to query.
     * @return The balance of the specified address.
     */
    function balanceOf(address who) external view returns (uint256);

    /**
     * @param who The address to query.
     * @return The balance of the specified address in shares.
     */
    function sharesOf(address who) external view returns (uint256);

    /**
     * @dev Transfer tokens to a specified address.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     * @return True on success, false otherwise.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Function to check the amount of tokens that an owner has allowed to a spender.
     * @param owner_ The address which owns the funds.
     * @param spender The address which will spend the funds.
     * @return The number of tokens still available for the spender.
     */
    function allowance(address owner_, address spender) external view returns (uint256);

    /**
     * @dev Transfer tokens from one address to another.
     * @param from The address you want to send tokens from.
     * @param to The address you want to transfer to.
     * @param value The amount of tokens to be transferred.
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of
     * msg.sender. This method is included for ERC20 compatibility.
     * increaseAllowance and decreaseAllowance should be used instead.
     * Changing an allowance with this method brings the risk that someone may transfer both
     * the old and the new allowance - if they are both greater than zero - if a transfer
     * transaction is mined before the later approve() call is mined.
     *
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Increase the amount of tokens that an owner has allowed to a spender.
     * This method should be used instead of approve() to avoid the double approval vulnerability
     * described above.
     * @param spender The address which will spend the funds.
     * @param addedValue The amount of tokens to increase the allowance by.
     */
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);

    /**
     * @dev Decrease the amount of tokens that an owner has allowed to a spender.
     *
     * @param spender The address which will spend the funds.
     * @param subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool);

    /** Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply, keeping the tokens per shares constant
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     */
    function mint(address account, uint256 amount) external;

    /**
     * Destroys `amount` tokens from `supplyController` account, reducing the
     * total supply while keeping the tokens per shares ratio constant
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     */
    function burn(uint256 amount) external;

    // Downstream transactions

    /**
     * @return Address of the downstream caller contract
     */
    function downstreamCallerAddress() external returns (address);

    /**
     * @param _downstreamCaller Address of the new downstream caller contract
     */
    function setDownstreamCaller(address _downstreamCaller) external;

    /**
     * @notice Adds a transaction that gets called for a downstream receiver of token distributions
     * @param destination Address of contract destination
     * @param data Transaction data payload
     * @return index of the newly added transaction
     */
    function addTransaction(address destination, bytes memory data) external returns (uint256);

    /**
     * @param index Index of transaction to remove.
     *              Transaction ordering may have changed since adding.
     */
    function removeTransaction(uint256 index) external;

    /**
     * @param index Index of transaction. Transaction ordering may have changed since adding.
     * @param enabled True for enabled, false for disabled.
     */
    function setTransactionEnabled(uint256 index, bool enabled) external;

    /**
     * @return Number of transactions, both enabled and disabled, in transactions list.
     */
    function transactionsSize() external view returns (uint256);

    /**
     * @dev Triggers stopped state.
     */
    function pause() external;

    /**
     * @dev Returns to normal state.
     */
    function unpause() external;

    /**
     * @dev Set blacklisted status for the account.
     * @param account address to set blacklist flag for
     * @param _isBlacklisted blacklist flag value
     *
     * Requirements:
     *
     * - `msg.sender` should be owner.
     */
    function setBlacklisted(address account, bool _isBlacklisted) external;
}
