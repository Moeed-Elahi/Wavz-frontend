import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}

export function formatPrice(price: number, solPriceUsd: number = 90): string {
  // Convert SOL price to USD
  const usdPrice = price * solPriceUsd;
  
  if (usdPrice < 0.00000001) {
    return '$0.00000001';
  }
  if (usdPrice < 0.0000001) {
    return '$' + usdPrice.toFixed(10);
  }
  if (usdPrice < 0.000001) {
    return '$' + usdPrice.toFixed(9);
  }
  if (usdPrice < 0.00001) {
    return '$' + usdPrice.toFixed(8);
  }
  if (usdPrice < 0.0001) {
    return '$' + usdPrice.toFixed(7);
  }
  if (usdPrice < 0.001) {
    return '$' + usdPrice.toFixed(6);
  }
  if (usdPrice < 0.01) {
    return '$' + usdPrice.toFixed(5);
  }
  if (usdPrice < 1) {
    return '$' + usdPrice.toFixed(4);
  }
  return '$' + usdPrice.toFixed(2);
}

export function formatTimeAgo(timestamp: number | Date | string): string {
  const time = typeof timestamp === 'number' 
    ? timestamp 
    : new Date(timestamp).getTime();
  const seconds = Math.floor((Date.now() - time) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000);
}

export function formatSol(lamports: number): string {
  const sol = lamportsToSol(lamports);
  return formatNumber(sol) + ' SOL';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
