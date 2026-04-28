'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';

const TOTAL_SUPPLY_UI = 1_000_000_000; // 1B tokens

export interface OnChainHolder {
  owner: string;
  tokenAccount: string;
  balance: number;   // raw (6 decimals)
  uiBalance: number; // display amount (divided by 1e6)
  percentage: number;
}

export function useOnChainHolders(mint: string) {
  const { connection } = useConnection();
  const [holders, setHolders] = useState<OnChainHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHolders = useCallback(async () => {
    if (!mint) return;
    try {
      const mintPubkey = new PublicKey(mint);

      // Verify the account is actually an SPL token mint before querying holders
      const mintInfo = await connection.getAccountInfo(mintPubkey);
      if (!mintInfo || mintInfo.data.length < 82) {
        // Not a valid mint yet (token may still be creating or address is wrong)
        setHolders([]);
        setLoading(false);
        return;
      }

      // Step 1: get largest token accounts (sorted by balance desc)
      const { value: accounts } = await connection.getTokenLargestAccounts(mintPubkey);

      // Filter out zero-balance accounts immediately — holders who sold 100% still show here
      const nonZero = accounts.filter((acc) => Number(acc.amount) > 0);

      if (nonZero.length === 0) {
        setHolders([]);
        setLoading(false);
        return;
      }

      // Step 2: batch-fetch raw account data to decode owner via AccountLayout
      // getMultipleAccountsInfo is widely supported in web3.js v1
      const pubkeys = nonZero.map((acc) => acc.address);
      const accountInfos = await connection.getMultipleAccountsInfo(pubkeys);

      const result: OnChainHolder[] = [];
      for (let i = 0; i < nonZero.length; i++) {
        const acc = nonZero[i];
        const info = accountInfos[i];

        let owner = acc.address.toBase58(); // fallback: token account address
        if (info?.data && info.data.length >= AccountLayout.span) {
          try {
            const decoded = AccountLayout.decode(info.data);
            owner = new PublicKey(decoded.owner).toBase58();
          } catch {
            // keep fallback
          }
        }

        const rawBalance = Number(acc.amount);
        const uiBalance = acc.uiAmount ?? rawBalance / 1e6;
        result.push({
          owner,
          tokenAccount: acc.address.toBase58(),
          balance: rawBalance,
          uiBalance,
          percentage: (uiBalance / TOTAL_SUPPLY_UI) * 100,
        });
      }

      setHolders(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch on-chain holders');
      console.error('useOnChainHolders error:', err);
    } finally {
      setLoading(false);
    }
  }, [connection, mint]);

  useEffect(() => {
    setLoading(true);
    fetchHolders();
    const interval = setInterval(fetchHolders, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchHolders]);

  return { holders, loading, error, refetch: fetchHolders };
}
