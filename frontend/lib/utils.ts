import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate an Ethereum address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number | string): string {
  return Number(num).toLocaleString('en-US');
}

/**
 * Format ETH value with proper decimals
 */
export function formatEth(wei: bigint | string, decimals = 4): string {
  const value = typeof wei === 'string' ? BigInt(wei) : wei;
  const eth = Number(value) / 1e18;
  return eth.toFixed(decimals);
}

/**
 * Format gas value
 */
export function formatGas(gas: bigint | string): string {
  const value = typeof gas === 'string' ? BigInt(gas) : gas;
  return formatNumber(value.toString());
}

/**
 * Convert hex to bytes32 for owner encoding
 */
export function addressToOwnerBytes(address: string): `0x${string}` {
  // Remove 0x prefix if present
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  // Pad with zeros to 32 bytes
  return `0x${'0'.repeat(24)}${cleanAddress.toLowerCase()}` as `0x${string}`;
}

/**
 * Decode owner bytes to address
 */
export function ownerBytesToAddress(ownerBytes: string): string {
  // Take last 20 bytes (40 hex chars)
  const address = ownerBytes.slice(-40);
  return `0x${address}`;
}

/**
 * Check if owner bytes is an address
 */
export function isOwnerBytesAddress(ownerBytes: string): boolean {
  // If the first 24 bytes are zeros, it's an address
  const prefix = ownerBytes.slice(2, 26); // Skip 0x and take next 24 chars
  return prefix === '0'.repeat(24);
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number | Date): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number | Date): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Get block explorer URL
 */
export function getBlockExplorerUrl(
  chainId: number,
  type: 'tx' | 'address' | 'block',
  value: string
): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    8453: 'https://basescan.org',
    11155111: 'https://sepolia.etherscan.io',
    84532: 'https://sepolia.basescan.org',
  };

  const baseUrl = explorers[chainId] || explorers[1];
  return `${baseUrl}/${type}/${value}`;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
