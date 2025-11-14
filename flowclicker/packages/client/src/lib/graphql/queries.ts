/**
 * GraphQL Queries and Subscriptions for MUD Indexer
 *
 * These queries map directly to the MUD tables defined in mud.config.ts:
 * - Player: Player statistics and anti-bot metrics
 * - GlobalState: Overall game statistics
 * - Country: Country leaderboard data
 * - ClickSession: Anti-bot session tracking
 */

import { gql } from 'urql';

/**
 * Query: Get Player Data
 * Fetches all statistics for a specific player address
 */
export const GET_PLAYER_DATA = gql`
  query GetPlayerData($player: String!) {
    flowclicker_Player(where: { player: { _eq: $player } }) {
      player
      totalClicks
      totalRewards
      countryCode
      lastClickTimestamp
      trustScore
      sequentialMaxClicks
      isBotFlagged
    }
  }
`;

/**
 * Subscription: Player Data Updates
 * Real-time updates when player data changes
 */
export const SUBSCRIBE_PLAYER_DATA = gql`
  subscription SubscribePlayerData($player: String!) {
    flowclicker_Player(where: { player: { _eq: $player } }) {
      player
      totalClicks
      totalRewards
      countryCode
      lastClickTimestamp
      trustScore
      sequentialMaxClicks
      isBotFlagged
    }
  }
`;

/**
 * Query: Get Global State
 * Fetches overall game statistics
 */
export const GET_GLOBAL_STATE = gql`
  query GetGlobalState {
    flowclicker_GlobalState(limit: 1) {
      totalClicks
      totalPlayers
      startTimestamp
      currentRewardRate
      totalRewardsDistributed
    }
  }
`;

/**
 * Subscription: Global State Updates
 * Real-time updates to global game state
 */
export const SUBSCRIBE_GLOBAL_STATE = gql`
  subscription SubscribeGlobalState {
    flowclicker_GlobalState(limit: 1) {
      totalClicks
      totalPlayers
      startTimestamp
      currentRewardRate
      totalRewardsDistributed
    }
  }
`;

/**
 * Query: Get Country Leaderboard
 * Fetches top countries by click count
 */
export const GET_COUNTRY_LEADERBOARD = gql`
  query GetCountryLeaderboard($limit: Int = 10) {
    flowclicker_Country(
      order_by: { totalClicks: desc }
      limit: $limit
    ) {
      code
      totalClicks
      playerCount
      rank
    }
  }
`;

/**
 * Subscription: Country Leaderboard Updates
 * Real-time leaderboard updates
 */
export const SUBSCRIBE_COUNTRY_LEADERBOARD = gql`
  subscription SubscribeCountryLeaderboard($limit: Int = 10) {
    flowclicker_Country(
      order_by: { totalClicks: desc }
      limit: $limit
    ) {
      code
      totalClicks
      playerCount
      rank
    }
  }
`;

/**
 * Query: Get Player's Click Session
 * Fetches current session data for anti-bot tracking
 */
export const GET_CLICK_SESSION = gql`
  query GetClickSession($player: String!, $sessionStart: String!) {
    flowclicker_ClickSession(
      where: {
        player: { _eq: $player }
        sessionStart: { _eq: $sessionStart }
      }
    ) {
      player
      sessionStart
      clicksInSession
      isValid
    }
  }
`;
