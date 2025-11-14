/**
 * FlowClicker Game Types
 */

export interface PlayerData {
  totalClicks: bigint;
  totalRewards: bigint;
  countryCode: string;
  lastClickTimestamp: number;
  trustScore: number;
  sequentialMaxClicks: number;
  isBotFlagged: boolean;
}

export interface CountryData {
  code: string;
  totalClicks: bigint;
  playerCount: number;
  rank: number;
}

export interface GlobalStateData {
  totalClicks: bigint;
  totalPlayers: number;
  startTimestamp: number;
  currentRewardRate: bigint;
  totalRewardsDistributed: bigint;
}

export interface ClickSessionData {
  clicksInSession: number;
  isValid: boolean;
}

export interface ClickResult {
  success: boolean;
  tokensMinted: number;
  trustScore: number;
  error?: string;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  value: number;
  timestamp: number;
}

export interface GameStats {
  clicksThisSession: number;
  tokensEarnedThisSession: number;
  avgClickRate: number;
  currentMultiplier: number;
}

export type TrustLevel = "perfect" | "excellent" | "good" | "suspicious" | "bot";

export interface LeaderboardEntry {
  address: string;
  clicks: bigint;
  rewards: bigint;
  country: string;
  rank: number;
}
