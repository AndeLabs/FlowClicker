import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespace: "flowclicker",
  tables: {
    // Player data - stores all player statistics and anti-bot metrics
    Player: {
      schema: {
        player: "address",           // Player wallet address
        totalClicks: "uint256",       // Lifetime total clicks
        totalRewards: "uint256",      // Total $FLOW tokens earned
        countryCode: "bytes32",       // Country code (e.g., "US", "MX", "JP")
        lastClickTimestamp: "uint64", // Timestamp of last click
        trustScore: "uint16",         // Anti-bot trust score (0-1000)
        sequentialMaxClicks: "uint8", // Max sequential clicks detected
        isBotFlagged: "bool",         // Bot detection flag
      },
      key: ["player"],
    },

    // Country leaderboard - tracks clicks per country
    Country: {
      schema: {
        code: "bytes32",           // Country code
        totalClicks: "uint256",    // Total clicks for this country
        playerCount: "uint32",     // Number of unique players
        rank: "uint16",            // Current ranking position
      },
      key: ["code"],
    },

    // Global game state - single row with overall stats
    GlobalState: {
      schema: {
        totalClicks: "uint256",            // Total clicks across all players
        totalPlayers: "uint32",            // Total unique players
        startTimestamp: "uint64",          // Game start time (for decay calculation)
        currentRewardRate: "uint256",      // Current $FLOW per click (18 decimals)
        totalRewardsDistributed: "uint256", // Total $FLOW minted
      },
      key: [],
    },

    // Click session tracking - for anti-bot analysis
    ClickSession: {
      schema: {
        player: "address",           // Player address
        sessionStart: "uint64",      // Session start timestamp
        clicksInSession: "uint32",   // Clicks in this session
        isValid: "bool",             // Session validity flag
      },
      key: ["player", "sessionStart"],
    },
  },

  // System access control
  systems: {
    ClickSystem: {
      openAccess: true,  // Players can call click() directly
    },
  },
});
