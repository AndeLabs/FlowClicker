import { useState, useEffect, useCallback } from "react";
import { GameStats } from "../../types/game";

interface UseGameStateReturn {
  stats: GameStats;
  incrementClick: () => void;
  addTokens: (amount: number) => void;
  resetSession: () => void;
}

export function useGameState(): UseGameStateReturn {
  const [stats, setStats] = useState<GameStats>({
    clicksThisSession: 0,
    tokensEarnedThisSession: 0,
    avgClickRate: 0,
    currentMultiplier: 1,
  });

  const [sessionStartTime] = useState(Date.now());
  const [lastClickTime, setLastClickTime] = useState(Date.now());

  const incrementClick = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      clicksThisSession: prev.clicksThisSession + 1,
    }));
    setLastClickTime(Date.now());
  }, []);

  const addTokens = useCallback((amount: number) => {
    setStats((prev) => ({
      ...prev,
      tokensEarnedThisSession: prev.tokensEarnedThisSession + amount,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setStats({
      clicksThisSession: 0,
      tokensEarnedThisSession: 0,
      avgClickRate: 0,
      currentMultiplier: 1,
    });
  }, []);

  // Calculate average click rate
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - sessionStartTime) / 1000;
      if (elapsed > 0) {
        setStats((prev) => ({
          ...prev,
          avgClickRate: prev.clicksThisSession / elapsed,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, stats.clicksThisSession]);

  return {
    stats,
    incrementClick,
    addTokens,
    resetSession,
  };
}
