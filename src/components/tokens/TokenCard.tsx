'use client';

import { FC, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Users, Rocket } from 'lucide-react';
import { formatNumber, formatPrice, formatTimeAgo } from '@/lib/utils';
import { useSolPrice } from '@/hooks/useSolPrice';
import type { Token } from '@/hooks/useApi';

interface TokenCardProps {
  token: Token | {
    mint: string;
    name: string;
    symbol: string;
    image?: string;
    marketCap: number;
    price: number;
    priceChange24h: number;
    volume24h: number;
    createdAt: number | Date;
    graduated: boolean;
    realSolReserves?: bigint | number | string;
    virtualSolReserves?: bigint | number | string;
    virtualTokenReserves?: bigint | number | string;
    _count?: {
      holders?: number;
    };
  };
}

export const TokenCard: FC<TokenCardProps> = ({ token }) => {
  const priceChange = token.priceChange24h || 0;
  const isPositive = priceChange >= 0;
  const holders = token._count?.holders || 0;
  const defaultImage = `https://api.dicebear.com/7.x/shapes/svg?seed=${token.mint}`;
  
  // Get dynamic SOL price
  const { price: solPriceUsd } = useSolPrice();

  // Calculate market cap based on current bonding curve price
  const liquidityMarketCap = useMemo(() => {
    const TOTAL_SUPPLY = 1_000_000_000;
    
    const virtualSol = Number(token.virtualSolReserves || 0) / 1e9;
    const virtualTokens = Number(token.virtualTokenReserves || 0) / 1e6;
    
    // Market cap = Current Price × Total Supply
    // Current Price = virtualSol / virtualTokens (bonding curve price)
    if (virtualTokens > 0 && virtualSol > 0) {
      const currentPrice = virtualSol / virtualTokens;
      return currentPrice * TOTAL_SUPPLY * solPriceUsd;
    }
    return 0;
  }, [token, solPriceUsd]);

  return (
    <Link href={`/token/${token.mint}`}>
      <div className="token-card card-glow group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface-light">
              <Image
                src={token.image || defaultImage}
                alt={token.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-primary-500 transition-colors">
                {token.name}
              </h3>
              <p className="text-sm text-gray-500">${token.symbol}</p>
            </div>
          </div>
          {token.graduated && (
            <div className="flex items-center space-x-1 text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
              <Rocket className="w-3 h-3" />
              <span>Graduated</span>
            </div>
          )}
        </div>

        {/* Price and change */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-semibold">{formatPrice(token.price || 0, solPriceUsd)}</p>
          </div>
          <div
            className={`flex items-center space-x-1 ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-surface-light rounded-lg p-2 text-center">
            <p className="text-gray-500 text-xs">MCap</p>
            <p className="font-medium">${formatNumber(liquidityMarketCap)}</p>
          </div>
          <div className="bg-surface-light rounded-lg p-2 text-center">
            <p className="text-gray-500 text-xs">Vol 24h</p>
            <p className="font-medium">${formatNumber((token.volume24h || 0) * solPriceUsd)}</p>
          </div>
          <div className="bg-surface-light rounded-lg p-2 text-center">
            <p className="text-gray-500 text-xs">Holders</p>
            <p className="font-medium flex items-center justify-center">
              <Users className="w-3 h-3 mr-1" />
              {holders}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Created {formatTimeAgo(typeof token.createdAt === 'number' ? token.createdAt : new Date(token.createdAt).getTime())}
          </p>
        </div>
      </div>
    </Link>
  );
};
