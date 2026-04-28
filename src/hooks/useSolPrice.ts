import { useState, useEffect } from 'react';

// Jupiter Price API v2 — primary source
const JUPITER_PRICE_API = 'https://api.jup.ag/price/v2?ids=SOL';
// Wrapped SOL mint for Helius DAS fallback
const WSOL_MINT = 'So11111111111111111111111111111111111111112';
const CACHE_DURATION = 60_000; // 1 minute cache
const FALLBACK_PRICE = 83; // Last-resort hardcoded fallback

interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;

/** Fetch SOL price from Helius DAS getAsset as secondary fallback */
async function fetchPriceFromHelius(): Promise<number> {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (!rpcUrl) throw new Error('No Helius RPC URL configured');

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: '1',
      method: 'getAsset',
      params: { id: WSOL_MINT },
    }),
  });

  if (!response.ok) throw new Error('Helius request failed');
  const data = await response.json();
  const price = data?.result?.token_info?.price_info?.price_per_token;
  if (!price || isNaN(Number(price))) throw new Error('Invalid Helius price data');
  return Number(price);
}

/**
 * Hook to get current SOL price in USD
 * Primary: Jupiter API — Fallback: Helius DAS — Last resort: $83 hardcoded
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
        // 1. Try Jupiter (primary)
        const response = await fetch(JUPITER_PRICE_API);
        if (!response.ok) throw new Error('Jupiter request failed');

        const data = await response.json();
        const rawPrice = data?.data?.SOL?.price;
        const solPrice = rawPrice ? parseFloat(rawPrice) : NaN;
        if (!isNaN(solPrice) && solPrice > 0) {
          priceCache = { price: solPrice, timestamp: Date.now() };
          setPrice(solPrice);
          setError(null);
          return;
        }
        throw new Error('Invalid Jupiter price data');
      } catch (jupiterErr) {
        console.warn('Jupiter price failed, trying Helius fallback:', jupiterErr);
        try {
          // 2. Try Helius (secondary fallback)
          const heliusPrice = await fetchPriceFromHelius();
          priceCache = { price: heliusPrice, timestamp: Date.now() };
          setPrice(heliusPrice);
          setError(null);
        } catch (heliusErr) {
          console.error('Helius price fallback also failed:', heliusErr);
          setError('Price fetch failed — using last known price');
          // 3. Keep cached price or hardcoded fallback (already set as initial state)
        }
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
