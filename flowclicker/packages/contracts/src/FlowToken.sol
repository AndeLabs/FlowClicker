// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FlowToken
 * @notice $FLOW token with temporal decay mechanics
 * @dev ERC20 token that implements:
 *      - Mint-per-click mechanism (only authorized systems can mint)
 *      - 3-year temporal decay schedule
 *      - Deflationary burn mechanics
 */
contract FlowToken is ERC20, Ownable {
    // ========== CONSTANTS ==========

    /// @notice Tokens per click in Year 1 (0.01 FLOW = 10^16 wei)
    uint256 public constant YEAR_1_RATE = 10_000_000_000_000_000; // 0.01 FLOW

    /// @notice Tokens per click in Year 2 (0.004 FLOW = 4 * 10^15 wei)
    uint256 public constant YEAR_2_RATE = 4_000_000_000_000_000; // 0.004 FLOW

    /// @notice Tokens per click in Year 3 (0.001 FLOW = 10^15 wei)
    uint256 public constant YEAR_3_RATE = 1_000_000_000_000_000; // 0.001 FLOW

    /// @notice Tokens per click after Year 3 (0.0005 FLOW = 5 * 10^14 wei)
    uint256 public constant POST_YEAR_3_RATE = 500_000_000_000_000; // 0.0005 FLOW

    /// @notice Duration of one year in seconds
    uint256 public constant YEAR_DURATION = 365 days;

    // ========== STATE VARIABLES ==========

    /// @notice Game start timestamp (set at deployment)
    uint256 public immutable gameStartTime;

    /// @notice Mapping of authorized minters (ClickSystem)
    mapping(address => bool) public authorizedMinters;

    /// @notice Total tokens burned (for analytics)
    uint256 public totalBurned;

    // ========== EVENTS ==========

    event MinterAuthorized(address indexed minter, bool authorized);
    event TokensMinted(address indexed player, uint256 amount, uint256 currentRate);
    event TokensBurned(address indexed from, uint256 amount);

    // ========== ERRORS ==========

    error UnauthorizedMinter(address caller);
    error InvalidAmount(uint256 amount);

    // ========== CONSTRUCTOR ==========

    constructor() ERC20("Flow Token", "FLOW") Ownable(msg.sender) {
        gameStartTime = block.timestamp;
    }

    // ========== MINTER MANAGEMENT ==========

    /**
     * @notice Authorize or revoke minter permissions
     * @param minter Address to authorize/revoke
     * @param authorized True to authorize, false to revoke
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    // ========== MINT FUNCTIONS ==========

    /**
     * @notice Mint tokens to a player (called by ClickSystem)
     * @param player Address to mint tokens to
     * @param timestamp Current block timestamp for decay calculation
     * @return amount Amount of tokens minted
     */
    function mintForClick(address player, uint256 timestamp) external returns (uint256 amount) {
        if (!authorizedMinters[msg.sender]) revert UnauthorizedMinter(msg.sender);

        // Calculate tokens based on temporal decay
        amount = calculateTokensPerClick(timestamp);

        if (amount == 0) revert InvalidAmount(0);

        // Mint tokens to player
        _mint(player, amount);

        emit TokensMinted(player, amount, amount);

        return amount;
    }

    /**
     * @notice Calculate tokens per click based on time elapsed
     * @param timestamp Current timestamp
     * @return amount Tokens to mint for one click
     */
    function calculateTokensPerClick(uint256 timestamp) public view returns (uint256 amount) {
        uint256 elapsed = timestamp - gameStartTime;

        if (elapsed < YEAR_DURATION) {
            // Year 1: 0.01 FLOW per click
            return YEAR_1_RATE;
        } else if (elapsed < YEAR_DURATION * 2) {
            // Year 2: 0.004 FLOW per click (-60%)
            return YEAR_2_RATE;
        } else if (elapsed < YEAR_DURATION * 3) {
            // Year 3: 0.001 FLOW per click (-75%)
            return YEAR_3_RATE;
        } else {
            // Post Year 3: 0.0005 FLOW per click (sustainable)
            return POST_YEAR_3_RATE;
        }
    }

    /**
     * @notice Get current reward rate (for frontend display)
     * @return Current tokens per click
     */
    function getCurrentRewardRate() external view returns (uint256) {
        return calculateTokensPerClick(block.timestamp);
    }

    // ========== BURN FUNCTIONS ==========

    /**
     * @notice Burn tokens from an address (for deflationary mechanics)
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external {
        // Allow burning from:
        // 1. Owner (for admin purposes)
        // 2. Authorized minters (for boost/cosmetic purchases)
        // 3. The address itself (self-burn)
        require(
            msg.sender == owner() ||
            authorizedMinters[msg.sender] ||
            msg.sender == from,
            "FlowToken: unauthorized burn"
        );

        _burn(from, amount);
        totalBurned += amount;

        emit TokensBurned(from, amount);
    }

    /**
     * @notice Public burn function (users can burn their own tokens)
     * @param amount Amount to burn
     */
    function burnSelf(uint256 amount) external {
        _burn(msg.sender, amount);
        totalBurned += amount;
        emit TokensBurned(msg.sender, amount);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get time elapsed since game start
     * @return Seconds elapsed
     */
    function getTimeElapsed() external view returns (uint256) {
        return block.timestamp - gameStartTime;
    }

    /**
     * @notice Get current year of the game (1, 2, 3, or 4+)
     * @return Current year
     */
    function getCurrentYear() external view returns (uint256) {
        uint256 elapsed = block.timestamp - gameStartTime;
        uint256 year = (elapsed / YEAR_DURATION) + 1;
        return year > 4 ? 4 : year; // Cap at 4 for display purposes
    }
}
