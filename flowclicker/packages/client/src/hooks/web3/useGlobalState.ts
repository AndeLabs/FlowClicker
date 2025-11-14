import { useEffect, useState } from "react";
import { GlobalStateData } from "../../types/game";

// This is a placeholder that will be replaced with actual MUD SDK integration

export function useGlobalState() {
  const [globalState, setGlobalState] = useState<GlobalStateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual MUD SDK query
    const mockData: GlobalStateData = {
      totalClicks: 0n,
      totalPlayers: 0,
      startTimestamp: Math.floor(Date.now() / 1000),
      currentRewardRate: 10000000000000000n, // 0.01 FLOW in wei
      totalRewardsDistributed: 0n,
    };

    setGlobalState(mockData);
    setIsLoading(false);
  }, []);

  return {
    globalState,
    isLoading,
  };
}
