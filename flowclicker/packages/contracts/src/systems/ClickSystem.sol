// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Player, PlayerData } from "../codegen/tables/Player.sol";
import { Country, CountryData } from "../codegen/tables/Country.sol";
import { GlobalState, GlobalStateData } from "../codegen/tables/GlobalState.sol";
import { ClickSession, ClickSessionData } from "../codegen/tables/ClickSession.sol";
import { FlowToken } from "../FlowToken.sol";

/**
 * @title ClickSystem
 * @notice Core game logic for FlowClicker
 * @dev MUD System that handles:
 *      - Click validation and processing
 *      - Anti-bot checks (rate limiting, trust score)
 *      - Token minting via FlowToken contract
 *      - Leaderboard updates (player, country, global)
 */
contract ClickSystem is System {
    // ========== CONSTANTS ==========

    /// @notice Max clicks allowed in 30-second window (anti-bot)
    uint256 public constant MAX_CLICKS_PER_30_SECONDS = 800;

    /// @notice Duration of rate limiting window (30 seconds)
    uint256 public constant RATE_LIMIT_WINDOW = 30;

    /// @notice Maximum trust score (perfect player)
    uint16 public constant MAX_TRUST_SCORE = 1000;

    /// @notice Minimum trust score before flagging as bot
    uint16 public constant BOT_THRESHOLD = 300;

    /// @notice Trust score penalty for suspicious clicks
    uint16 public constant TRUST_PENALTY = 50;

    // ========== STATE VARIABLES ==========

    /// @notice FlowToken contract reference
    FlowToken public flowToken;

    // ========== EVENTS ==========

    event ClickProcessed(
        address indexed player,
        uint256 clickNumber,
        uint256 tokensMinted,
        uint16 trustScore
    );

    event BotDetected(address indexed player, uint16 trustScore);

    event NewPlayer(address indexed player, bytes32 countryCode);

    event CountryUpdated(bytes32 indexed countryCode, uint256 totalClicks);

    // ========== ERRORS ==========

    error BotFlagged(address player);
    error RateLimitExceeded(address player, uint256 clicksInWindow);
    error InvalidCountryCode(bytes32 code);

    // ========== INITIALIZATION ==========

    /**
     * @notice Initialize the ClickSystem with FlowToken address
     * @dev Called once during deployment
     * @param _flowToken Address of FlowToken contract
     */
    function initialize(address _flowToken) external {
        require(address(flowToken) == address(0), "Already initialized");
        flowToken = FlowToken(_flowToken);

        // Initialize GlobalState if not already done
        GlobalStateData memory globalState = GlobalState.get();
        if (globalState.startTimestamp == 0) {
            GlobalState.set(
                GlobalStateData({
                    totalClicks: 0,
                    totalPlayers: 0,
                    startTimestamp: uint64(block.timestamp),
                    currentRewardRate: flowToken.getCurrentRewardRate(),
                    totalRewardsDistributed: 0
                })
            );
        }
    }

    // ========== MAIN CLICK FUNCTION ==========

    /**
     * @notice Process a click from a player
     * @param countryCode Player's country code (e.g., keccak256("US"))
     * @param clientTimestamp Client-side timestamp (for anti-bot)
     * @return tokensMinted Amount of $FLOW tokens minted
     */
    function click(bytes32 countryCode, uint256 clientTimestamp) external returns (uint256 tokensMinted) {
        address player = _msgSender();

        // 1. Validate country code
        if (countryCode == bytes32(0)) revert InvalidCountryCode(countryCode);

        // 2. Load or create player data
        PlayerData memory playerData = Player.get(player);
        bool isNewPlayer = playerData.lastClickTimestamp == 0;

        if (isNewPlayer) {
            // Initialize new player
            playerData = PlayerData({
                totalClicks: 0,
                totalRewards: 0,
                countryCode: countryCode,
                lastClickTimestamp: 0,
                trustScore: MAX_TRUST_SCORE, // Start with perfect trust
                sequentialMaxClicks: 0,
                isBotFlagged: false
            });
        }

        // 3. Check if player is flagged as bot
        if (playerData.isBotFlagged) revert BotFlagged(player);

        // 4. Anti-bot validation
        uint16 newTrustScore = _validateClick(player, playerData, clientTimestamp);

        // 5. Check if trust score dropped below bot threshold
        if (newTrustScore < BOT_THRESHOLD) {
            playerData.isBotFlagged = true;
            Player.set(player, playerData);
            emit BotDetected(player, newTrustScore);
            revert BotFlagged(player);
        }

        // 6. Mint tokens via FlowToken
        tokensMinted = flowToken.mintForClick(player, block.timestamp);

        // 7. Update player data
        playerData.totalClicks += 1;
        playerData.totalRewards += tokensMinted;
        playerData.lastClickTimestamp = uint64(block.timestamp);
        playerData.trustScore = newTrustScore;
        Player.set(player, playerData);

        // 8. Update country leaderboard
        _updateCountry(countryCode, isNewPlayer);

        // 9. Update global state
        _updateGlobalState(tokensMinted, isNewPlayer);

        // 10. Emit event
        emit ClickProcessed(player, playerData.totalClicks, tokensMinted, newTrustScore);

        if (isNewPlayer) {
            emit NewPlayer(player, countryCode);
        }

        return tokensMinted;
    }

    // ========== ANTI-BOT VALIDATION ==========

    /**
     * @notice Validate click and calculate new trust score
     * @param player Player address
     * @param playerData Current player data
     * @param clientTimestamp Client timestamp
     * @return newTrustScore Updated trust score
     */
    function _validateClick(
        address player,
        PlayerData memory playerData,
        uint256 clientTimestamp
    ) internal returns (uint16 newTrustScore) {
        uint64 currentTime = uint64(block.timestamp);
        uint64 lastClick = playerData.lastClickTimestamp;

        newTrustScore = playerData.trustScore;

        // Skip validation for first click
        if (lastClick == 0) {
            return newTrustScore;
        }

        uint64 timeSinceLastClick = currentTime - lastClick;

        // Check 1: Rate limiting (800 clicks per 30 seconds)
        ClickSessionData memory session = ClickSession.get(player, _getSessionStart(currentTime));

        if (timeSinceLastClick < RATE_LIMIT_WINDOW) {
            session.clicksInSession += 1;

            if (session.clicksInSession > MAX_CLICKS_PER_30_SECONDS) {
                revert RateLimitExceeded(player, session.clicksInSession);
            }

            // Penalize trust if clicking suspiciously fast (multiple clicks in same second)
            if (timeSinceLastClick == 0) {
                newTrustScore = newTrustScore > TRUST_PENALTY ? newTrustScore - TRUST_PENALTY : 0;
            }
        } else {
            // New session window
            session = ClickSessionData({
                clicksInSession: 1,
                isValid: true
            });
        }

        uint64 sessionStart = _getSessionStart(currentTime);
        ClickSession.set(player, sessionStart, session);

        // Check 2: Timestamp validation (client vs server)
        // Allow 5 second tolerance
        if (clientTimestamp > 0) {
            uint256 timestampDiff = clientTimestamp > currentTime
                ? clientTimestamp - currentTime
                : currentTime - clientTimestamp;

            if (timestampDiff > 5) {
                // Suspicious timestamp
                newTrustScore = newTrustScore > TRUST_PENALTY ? newTrustScore - TRUST_PENALTY : 0;
            }
        }

        // Check 3: Sequential click pattern detection
        // If clicking at exact same interval multiple times (bot pattern)
        if (timeSinceLastClick > 0 && timeSinceLastClick == playerData.sequentialMaxClicks) {
            newTrustScore = newTrustScore > TRUST_PENALTY * 2 ? newTrustScore - TRUST_PENALTY * 2 : 0;
        }

        return newTrustScore;
    }

    /**
     * @notice Get session start timestamp (30-second windows)
     * @param timestamp Current timestamp
     * @return Session start timestamp
     */
    function _getSessionStart(uint64 timestamp) internal pure returns (uint64) {
        return uint64((timestamp / RATE_LIMIT_WINDOW) * RATE_LIMIT_WINDOW);
    }

    // ========== LEADERBOARD UPDATES ==========

    /**
     * @notice Update country leaderboard
     * @param countryCode Country code
     * @param isNewPlayer Whether this is a new player
     */
    function _updateCountry(bytes32 countryCode, bool isNewPlayer) internal {
        CountryData memory countryData = Country.get(countryCode);

        countryData.totalClicks += 1;

        if (isNewPlayer) {
            countryData.playerCount += 1;
        }

        Country.set(countryCode, countryData);

        emit CountryUpdated(countryCode, countryData.totalClicks);
    }

    /**
     * @notice Update global game state
     * @param tokensMinted Tokens minted in this click
     * @param isNewPlayer Whether this is a new player
     */
    function _updateGlobalState(uint256 tokensMinted, bool isNewPlayer) internal {
        GlobalStateData memory globalState = GlobalState.get();

        globalState.totalClicks += 1;
        globalState.totalRewardsDistributed += tokensMinted;
        globalState.currentRewardRate = flowToken.getCurrentRewardRate();

        if (isNewPlayer) {
            globalState.totalPlayers += 1;
        }

        GlobalState.set(globalState);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get player data
     * @param player Player address
     * @return Player data
     */
    function getPlayer(address player) external view returns (PlayerData memory) {
        return Player.get(player);
    }

    /**
     * @notice Get country data
     * @param countryCode Country code
     * @return Country data
     */
    function getCountry(bytes32 countryCode) external view returns (CountryData memory) {
        return Country.get(countryCode);
    }

    /**
     * @notice Get global game state
     * @return Global state data
     */
    function getGlobalState() external view returns (GlobalStateData memory) {
        return GlobalState.get();
    }

    /**
     * @notice Get current session for a player
     * @param player Player address
     * @return Session data
     */
    function getCurrentSession(address player) external view returns (ClickSessionData memory) {
        uint64 sessionStart = _getSessionStart(uint64(block.timestamp));
        return ClickSession.get(player, sessionStart);
    }
}
