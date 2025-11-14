/**
 * Formatting utilities for numbers, dates, and addresses
 */

/**
 * Format number with comma separators
 * Example: 1000000 => "1,000,000"
 */
export function formatNumber(num: number | bigint): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format number to compact notation
 * Example: 1500 => "1.5K", 1500000 => "1.5M"
 */
export function formatCompact(num: number | bigint): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
}

/**
 * Format token amount with decimals
 * Example: 0.01 => "0.01 FLOW"
 */
export function formatTokens(amount: number | bigint, symbol: string = "FLOW"): string {
  const formatted = typeof amount === "bigint"
    ? formatNumber(amount)
    : amount.toFixed(amount < 1 ? 4 : 2);

  return `${formatted} ${symbol}`;
}

/**
 * Format large token amounts in compact form
 * Example: 1500.5 => "1.5K FLOW"
 */
export function formatTokensCompact(amount: number, symbol: string = "FLOW"): string {
  const formatted = formatCompact(amount);
  return `${formatted} ${symbol}`;
}

/**
 * Format percentage
 * Example: 0.75 => "75%"
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format Ethereum address to short form
 * Example: "0x1234...5678"
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;

  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format timestamp to relative time
 * Example: "2 hours ago", "5 minutes ago"
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = Math.floor((now - timestamp * 1000) / 1000); // Convert to seconds

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return new Date(timestamp * 1000).toLocaleDateString();
}

/**
 * Format duration from seconds
 * Example: 3665 => "1h 1m 5s"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Format date to human-readable string
 * Example: "Jan 15, 2025 at 3:45 PM"
 */
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}

/**
 * Format number with decimals
 */
export function formatDecimals(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Format hash (transaction, block)
 */
export function formatHash(hash: string, startChars: number = 6, endChars: number = 4): string {
  if (!hash) return "";
  if (hash.length <= startChars + endChars + 2) return hash;

  return `${hash.slice(0, startChars + 2)}...${hash.slice(-endChars)}`;
}

/**
 * Format click rate (clicks per second)
 */
export function formatClickRate(clicks: number, seconds: number): string {
  if (seconds === 0) return "0.00";
  const rate = clicks / seconds;
  return rate.toFixed(2);
}

/**
 * Format trust score with indicator
 */
export function formatTrustScore(score: number): string {
  let indicator = "";
  if (score >= 900) indicator = "🌟";
  else if (score >= 700) indicator = "💎";
  else if (score >= 500) indicator = "✨";
  else if (score >= 300) indicator = "🤔";
  else indicator = "❌";

  return `${score} ${indicator}`;
}
