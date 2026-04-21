import { useState, useEffect } from 'react';

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
const CACHE_DURATION = 60_000; // 1 minute cache
const FALLBACK_PRICE = 90; // Fallback if API fails

interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;

/**
 * Hook to get current SOL price in USD
 * Uses CoinGecko free API with caching
 */
export function useSolPrice() {
  const [price, setPrice] = useState<number>(priceCache?.price || FALLBACK_PRICE);
  const [loading, setLoading] = useState(!priceCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      // Check cache first
      if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
        setPrice(priceCache.price);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(COINGECKO_API);
        if (!response.ok) {
          throw new Error('Failed to fetch SOL price');
        }
        
        const data = await response.json();
        const solPrice = data.solana?.usd;
        
        if (solPrice && typeof solPrice === 'number') {
          priceCache = { price: solPrice, timestamp: Date.now() };
          setPrice(solPrice);
          setError(null);
        } else {
          throw new Error('Invalid price data');
        }
      } catch (err) {
        console.error('SOL price fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep using cached/fallback price
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    
    // Refresh price every minute
    const interval = setInterval(fetchPrice, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return { price, loading, error };
}

/**
 * Get SOL price synchronously (from cache or fallback)
 * Useful for non-hook contexts
 */
export function getSolPrice(): number {
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.price;
  }
  return FALLBACK_PRICE;
}

/**
 * Calculate USD value from SOL amount
 */
export function solToUsd(solAmount: number, solPrice?: number): number {
  return solAmount * (solPrice || getSolPrice());
}
