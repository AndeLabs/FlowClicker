import { useQuery, useSubscription } from "urql";
import { PlayerData } from "../../types/game";
import { GET_PLAYER_DATA, SUBSCRIBE_PLAYER_DATA } from "../../lib/graphql/queries";

/**
 * usePlayerData Hook
 * Fetches and subscribes to real-time player data from MUD Indexer
 *
 * Features:
 * - Initial query for player data
 * - Real-time subscription for live updates
 * - Automatic fallback to mock data if indexer is unavailable
 * - Type-safe data transformation
 */
export function usePlayerData(address?: string) {
  // Query player data from MUD Indexer
  const [queryResult] = useQuery({
    query: GET_PLAYER_DATA,
    variables: { player: address?.toLowerCase() || "" },
    pause: !address, // Don't query if no address
  });

  // Subscribe to real-time updates
  const [subscriptionResult] = useSubscription({
    query: SUBSCRIBE_PLAYER_DATA,
    variables: { player: address?.toLowerCase() || "" },
    pause: !address, // Don't subscribe if no address
  });

  // Use subscription data if available, otherwise use query data
  const data = subscriptionResult.data || queryResult.data;
  const isLoading = queryResult.fetching && !data;
  const error = queryResult.error || subscriptionResult.error;

  // Transform GraphQL data to PlayerData type
  const playerData: PlayerData | null = data?.flowclicker_Player?.[0]
    ? {
        totalClicks: BigInt(data.flowclicker_Player[0].totalClicks || 0),
        totalRewards: BigInt(data.flowclicker_Player[0].totalRewards || 0),
        countryCode: data.flowclicker_Player[0].countryCode || "US",
        lastClickTimestamp: Number(data.flowclicker_Player[0].lastClickTimestamp || 0),
        trustScore: Number(data.flowclicker_Player[0].trustScore || 1000),
        sequentialMaxClicks: Number(data.flowclicker_Player[0].sequentialMaxClicks || 0),
        isBotFlagged: Boolean(data.flowclicker_Player[0].isBotFlagged),
      }
    : null;

  // Fallback to mock data if indexer is unavailable and we have an address
  // This allows the UI to work during development or indexer downtime
  const fallbackData: PlayerData | null = address && error
    ? {
        totalClicks: 0n,
        totalRewards: 0n,
        countryCode: "US",
        lastClickTimestamp: 0,
        trustScore: 1000,
        sequentialMaxClicks: 0,
        isBotFlagged: false,
      }
    : null;

  return {
    playerData: playerData || fallbackData,
    isLoading,
    error,
  };
}
