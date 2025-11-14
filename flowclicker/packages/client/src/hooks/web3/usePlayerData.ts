import { useEffect, useState } from "react";
import { PlayerData } from "../../types/game";

// This is a placeholder that will be replaced with actual MUD SDK integration
// For now, it returns mock data to allow the UI to work

export function usePlayerData(address?: string) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual MUD SDK query
    // This is mock data for development
    const mockData: PlayerData = {
      totalClicks: 0n,
      totalRewards: 0n,
      countryCode: "US",
      lastClickTimestamp: 0,
      trustScore: 1000,
      sequentialMaxClicks: 0,
      isBotFlagged: false,
    };

    setPlayerData(mockData);
    setIsLoading(false);
  }, [address]);

  return {
    playerData,
    isLoading,
  };
}
