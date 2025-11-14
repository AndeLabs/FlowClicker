/**
 * FlowClicker Game Constants
 */

// Game Configuration
export const GAME_CONFIG = {
  MAX_TRUST_SCORE: 1000,
  BOT_THRESHOLD: 300,
  RATE_LIMIT_WINDOW: 30, // seconds
  MAX_CLICKS_PER_WINDOW: 800,
  YEAR_DURATION: 365 * 24 * 60 * 60, // 1 year in seconds
} as const;

// Token Reward Rates (in FLOW tokens per click)
export const REWARD_RATES = {
  YEAR_1: 0.01,     // 0.01 FLOW
  YEAR_2: 0.004,    // 0.004 FLOW (-60%)
  YEAR_3: 0.001,    // 0.001 FLOW (-75%)
  POST_3_YEARS: 0.0005, // 0.0005 FLOW (sustainable)
} as const;

// UI Configuration
export const UI_CONFIG = {
  PARTICLE_COUNT: 10,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  LEADERBOARD_UPDATE_INTERVAL: 10000, // 10 seconds
  STATS_UPDATE_INTERVAL: 1000, // 1 second
} as const;

// Country Codes (top gaming countries)
export const COUNTRY_CODES = {
  US: "US",
  MX: "MX",
  BR: "BR",
  AR: "AR",
  JP: "JP",
  KR: "KR",
  CN: "CN",
  IN: "IN",
  DE: "DE",
  FR: "FR",
  GB: "GB",
  ES: "ES",
  IT: "IT",
  RU: "RU",
  TR: "TR",
} as const;

// Trust Score Messages
export const TRUST_MESSAGES = {
  PERFECT: { min: 900, message: "Perfect Player 🌟", color: "#10b981" },
  EXCELLENT: { min: 700, message: "Excellent 💎", color: "#3b82f6" },
  GOOD: { min: 500, message: "Good Player ✨", color: "#8b5cf6" },
  SUSPICIOUS: { min: 300, message: "Suspicious 🤔", color: "#f59e0b" },
  BOT: { min: 0, message: "Bot Detected ❌", color: "#ef4444" },
} as const;

// Animation Variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  scale: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    pressed: { scale: 0.95 },
  },
  pulse: {
    rest: { scale: 1 },
    animate: { scale: [1, 1.1, 1] },
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "Please connect your wallet to play",
  BOT_DETECTED: "Bot behavior detected. Please play fair!",
  RATE_LIMIT: "Slow down! You're clicking too fast",
  NETWORK_ERROR: "Network error. Please try again",
  TRANSACTION_FAILED: "Transaction failed. Please try again",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CLICK_SUCCESS: "Click successful!",
  WALLET_CONNECTED: "Wallet connected successfully",
  REWARD_CLAIMED: "Reward claimed!",
} as const;
