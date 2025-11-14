import { useQuery, useSubscription } from "urql";
import { GlobalStateData } from "../../types/game";
import { GET_GLOBAL_STATE, SUBSCRIBE_GLOBAL_STATE } from "../../lib/graphql/queries";

/**
 * useGlobalState Hook
 * Fetches and subscribes to real-time global game state from MUD Indexer
 *
 * Features:
 * - Initial query for global state
 * - Real-time subscription for live updates
 * - Automatic fallback to mock data if indexer is unavailable
 * - Updates every time any player clicks
 */
export function useGlobalState() {
  // Query global state from MUD Indexer
  const [queryResult] = useQuery({
    query: GET_GLOBAL_STATE,
  });

  // Subscribe to real-time updates
  const [subscriptionResult] = useSubscription({
    query: SUBSCRIBE_GLOBAL_STATE,
  });

  // Use subscription data if available, otherwise use query data
  const data = subscriptionResult.data || queryResult.data;
  const isLoading = queryResult.fetching && !data;
  const error = queryResult.error || subscriptionResult.error;

  // Transform GraphQL data to GlobalStateData type
  const globalState: GlobalStateData | null = data?.flowclicker_GlobalState?.[0]
    ? {
        totalClicks: BigInt(data.flowclicker_GlobalState[0].totalClicks || 0),
        totalPlayers: Number(data.flowclicker_GlobalState[0].totalPlayers || 0),
        startTimestamp: Number(data.flowclicker_GlobalState[0].startTimestamp || Math.floor(Date.now() / 1000)),
        currentRewardRate: BigInt(data.flowclicker_GlobalState[0].currentRewardRate || 10000000000000000n),
        totalRewardsDistributed: BigInt(data.flowclicker_GlobalState[0].totalRewardsDistributed || 0),
      }
    : null;

  // Fallback to mock data if indexer is unavailable
  // This allows the UI to work during development or indexer downtime
  const fallbackData: GlobalStateData = {
    totalClicks: 0n,
    totalPlayers: 0,
    startTimestamp: Math.floor(Date.now() / 1000),
    currentRewardRate: 10000000000000000n, // 0.01 FLOW in wei
    totalRewardsDistributed: 0n,
  };

  return {
    globalState: globalState || fallbackData,
    isLoading,
    error,
  };
}
