/**
 * General utility functions for FlowClicker
 */

import { GAME_CONFIG, REWARD_RATES } from "./constants";

/**
 * Calculate tokens per click based on elapsed time since game start
 */
export function calculateTokensPerClick(startTimestamp: number, currentTimestamp: number): number {
  const elapsed = currentTimestamp - startTimestamp;
  const { YEAR_DURATION } = GAME_CONFIG;

  if (elapsed < YEAR_DURATION) {
    return REWARD_RATES.YEAR_1;
  } else if (elapsed < YEAR_DURATION * 2) {
    return REWARD_RATES.YEAR_2;
  } else if (elapsed < YEAR_DURATION * 3) {
    return REWARD_RATES.YEAR_3;
  } else {
    return REWARD_RATES.POST_3_YEARS;
  }
}

/**
 * Get current game year
 */
export function getCurrentGameYear(startTimestamp: number, currentTimestamp: number): number {
  const elapsed = currentTimestamp - startTimestamp;
  const year = Math.floor(elapsed / GAME_CONFIG.YEAR_DURATION) + 1;
  return Math.min(year, 4); // Cap at year 4 for display
}

/**
 * Calculate trust score color
 */
export function getTrustScoreColor(score: number): string {
  if (score >= 900) return "#10b981"; // green
  if (score >= 700) return "#3b82f6"; // blue
  if (score >= 500) return "#8b5cf6"; // purple
  if (score >= 300) return "#f59e0b"; // yellow
  return "#ef4444"; // red
}

/**
 * Calculate trust score message
 */
export function getTrustScoreMessage(score: number): string {
  if (score >= 900) return "Perfect Player 🌟";
  if (score >= 700) return "Excellent 💎";
  if (score >= 500) return "Good Player ✨";
  if (score >= 300) return "Suspicious 🤔";
  return "Bot Detected ❌";
}

/**
 * Generate random position for particle effects
 */
export function getRandomPosition(centerX: number, centerY: number, radius: number) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;

  return {
    x: centerX + Math.cos(angle) * distance,
    y: centerY + Math.sin(angle) * distance,
  };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user is on mobile device
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get country flag emoji
 */
export function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Convert bytes32 to string
 */
export function bytes32ToString(bytes32: string): string {
  return Buffer.from(bytes32.slice(2), "hex")
    .toString()
    .replace(/\0/g, "");
}

/**
 * Convert string to bytes32
 */
export function stringToBytes32(str: string): `0x${string}` {
  const hex = Buffer.from(str).toString("hex").padEnd(64, "0");
  return `0x${hex}` as `0x${string}`;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}
