'use client';

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ExternalLink, 
  Users, 
  Clock,
  Twitter,
  MessageCircle,
  Globe,
  Copy,
  Check,
  Rocket,
  Loader2
} from 'lucide-react';
import { TradePanel } from './TradePanel';
import { PriceChart } from './PriceChart';
import { TransactionHistory } from './TransactionHistory';
import { CommentSection } from './CommentSection';
import { formatNumber, formatPrice, shortenAddress, formatTimeAgo } from '@/lib/utils';
import { useSocket } from '@/components/providers/SocketProvider';
import { useSolPrice } from '@/hooks/useSolPrice';
import toast from 'react-hot-toast';

interface TokenDetailProps {
  mint: string;
}

interface Token {
  mint: string;
  name: string;
  symbol: string;
  uri: string | null;
  description?: string;
  image?: string;
  creatorAddress: string;
  virtualSolReserves: string;
  virtualTokenReserves: string;
  realSolReserves: string;
  realTokenReserves: string;
  graduated: boolean;
  meteoraPool?: string;
  createdAt: string;
  _count?: {
    trades: number;
    holders: number;
  };
  socials?: {
    twitter?: string;
    telegram?: string;
    website?: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const TokenDetail: FC<TokenDetailProps> = ({ mint }) => {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState<Token | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGraduating, setIsGraduating] = useState(false);
  const [meteoraPrice, setMeteoraPrice] = useState<number | null>(null);
  
  const { socket, subscribeToToken, unsubscribeFromToken, connected } = useSocket();
  const { price: solPriceUsd } = useSolPrice();

  useEffect(() => {
    let cancelled = false;

    const fetchToken = async (retries = 5) => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(`${API_URL}/api/tokens/${mint}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          if (res.status === 404 && retries > 0) {
            // Token might not be in DB yet - retry after a short delay
            await new Promise(r => setTimeout(r, 1500));
            if (!cancelled) return fetchToken(retries - 1);
            return;
          }
          throw new Error('Token not found');
        }
        const data = await res.json();
        if (cancelled) return;
        setToken(data);

        // Fetch metadata from URI if available
        if (data.uri) {
          try {
            const metaRes = await fetch(data.uri);
            const metaData = await metaRes.json();
            if (!cancelled) setMetadata(metaData);
          } catch (e) {
            console.log('Could not fetch metadata from URI');
          }
        }
      } catch (err) {
        if (!cancelled) {
          // On timeout or network error, retry if we have retries left
          if (retries > 0 && (err instanceof DOMException || (err instanceof Error && err.message !== 'Token not found'))) {
            await new Promise(r => setTimeout(r, 1500));
            if (!cancelled) return fetchToken(retries - 1);
            return;
          }
          setError(err instanceof Error ? err.message : 'Failed to load token');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchToken();

    return () => { cancelled = true; };
  }, [mint]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Subscribe when socket connects
    const handleConnect = () => {
      socket.emit('subscribe:token', mint);
    };

    // If already connected, subscribe immediately
    if (socket.connected) {
      socket.emit('subscribe:token', mint);
    }

    socket.on('connect', handleConnect);

    // Handle price updates (bonding curve)
    const handlePriceUpdate = (data: any) => {
      if (data.mint === mint) {
        setToken(prev => prev ? {
          ...prev,
          virtualSolReserves: data.virtualSolReserves,
          virtualTokenReserves: data.virtualTokenReserves,
          realSolReserves: data.realSolReserves ?? prev.realSolReserves,
        } : null);
      }
    };

    // Handle new trade (for price updates, holders, trade count, and reserves)
    const handleNewTrade = (data: any) => {
      if (data.mint !== mint) return;
      
      // Update Meteora price from trade
      if (data.isMeteoraSwap && data.price) {
        setMeteoraPrice(data.price / 1000);
      }
      
      // Update holder count, trade count, and reserves from every trade
      setToken(prev => {
        if (!prev) return null;
        const updates: Partial<Token> = {
          _count: {
            trades: (prev._count?.trades ?? 0) + 1,
            holders: data.holderCount ?? prev._count?.holders ?? 0,
          },
        };
        // For bonding curve trades, update reserves from trade data
        if (!data.isMeteoraSwap) {
          if (data.virtualSolReserves) updates.virtualSolReserves = data.virtualSolReserves;
          if (data.virtualTokenReserves) updates.virtualTokenReserves = data.virtualTokenReserves;
          if (data.realSolReserves) updates.realSolReserves = data.realSolReserves;
        }
        return { ...prev, ...updates };
      });
    };

    // Handle ready to graduate event
    const handleReadyToGraduate = (data: any) => {
      if (data.mint === mint) {
        console.log('Token ready to graduate!', data);
        setIsGraduating(true);
        setToken(prev => prev ? {
          ...prev,
          realSolReserves: data.realSolReserves || prev.realSolReserves,
        } : null);
        toast.loading('🎓 Graduating to Meteora...', { id: 'graduation' });
      }
    };

    // Handle graduation complete event
    const handleGraduated = (data: any) => {
      if (data.mint === mint) {
        console.log('Token graduated!', data);
        setIsGraduating(false);
        setToken(prev => prev ? { 
          ...prev, 
          graduated: true,
          meteoraPool: data.meteoraPool || prev.meteoraPool,
        } : null);
        toast.success(
          `🚀 Token graduated to Meteora!\n${data.meteoraPool ? `Pool: ${data.meteoraPool.slice(0, 8)}...` : ''}`,
          { id: 'graduation', duration: 5000 }
        );
      }
    };

    socket.on('price:update', handlePriceUpdate);
    socket.on('trade:new', handleNewTrade);
    socket.on('token:ready_to_graduate', handleReadyToGraduate);
    socket.on('token:graduated', handleGraduated);

    return () => {
      socket.emit('unsubscribe:token', mint);
      socket.off('connect', handleConnect);
      socket.off('price:update', handlePriceUpdate);
      socket.off('trade:new', handleNewTrade);
      socket.off('token:ready_to_graduate', handleReadyToGraduate);
      socket.off('token:graduated', handleGraduated);
    };
  }, [socket, mint]);

  // Fetch Meteora price for graduated tokens
  useEffect(() => {
    if (!token?.graduated || !token?.meteoraPool) {
      setMeteoraPrice(null);
      return;
    }

    const fetchMeteoraPrice = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const { default: DLMM } = await import('@meteora-ag/dlmm');
        const { Connection, PublicKey } = await import('@solana/web3.js');
        
        const connection = new Connection(
          process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'
        );
        
        const dlmm = await DLMM.create(
          connection, 
          new PublicKey(token.meteoraPool!),
          { cluster: 'devnet' }
        );
        
        const activeBin = await dlmm.getActiveBin();
        // Price from Meteora needs decimal adjustment
        // Token has 6 decimals, SOL has 9 decimals
        // activeBin.price is scaled by 10^(tokenDecimals - solDecimals) = 10^-3 = 0.001
        // So we divide by 1000 to get the actual SOL per token price
        const pricePerToken = parseFloat(activeBin.price) / 1000;
        setMeteoraPrice(pricePerToken);
        
        console.log('Meteora price fetched:', pricePerToken);
      } catch (err) {
        console.error('Failed to fetch Meteora price:', err);
      }
    };

    fetchMeteoraPrice();
    
    // Refresh price every 30 seconds
    const interval = setInterval(fetchMeteoraPrice, 30000);
    return () => clearInterval(interval);
  }, [token?.graduated, token?.meteoraPool]);

  // Optimistic update after bonding curve trade
  const handleTradeSuccess = (update: { isBuy: boolean; solAmount: number; tokenAmount: number }) => {
    setToken(prev => {
      if (!prev) return null;
      const solDelta = BigInt(update.solAmount);
      const tokenDelta = BigInt(update.tokenAmount);
      const prevVSol = BigInt(prev.virtualSolReserves);
      const prevVToken = BigInt(prev.virtualTokenReserves);
      const prevRSol = BigInt(prev.realSolReserves);
      
      const newVSol = update.isBuy ? prevVSol + solDelta : prevVSol - solDelta;
      const newVToken = update.isBuy ? prevVToken - tokenDelta : prevVToken + tokenDelta;
      const newRSol = update.isBuy ? prevRSol + solDelta : prevRSol - solDelta;
      
      return {
        ...prev,
        virtualSolReserves: newVSol.toString(),
        virtualTokenReserves: newVToken.toString(),
        realSolReserves: newRSol.toString(),
        _count: {
          trades: (prev._count?.trades ?? 0) + 1,
          holders: prev._count?.holders ?? 0,
        },
      };
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(mint);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error || 'Token not found'}</p>
      </div>
    );
  }

  // Calculate price - use Meteora price for graduated tokens, bonding curve for others
  const virtualSol = Number(token.virtualSolReserves) / 1e9;
  const virtualTokens = Number(token.virtualTokenReserves) / 1e6;
  const bondingCurvePrice = virtualSol / virtualTokens;
  
  // For graduated tokens, ONLY use Meteora price (bonding curve data is stale after graduation)
  // For non-graduated tokens, use bonding curve price
  const price = token.graduated ? meteoraPrice : bondingCurvePrice;
  const priceLoading = token.graduated && meteoraPrice === null;
  
  // Market cap calculation - price is in SOL, convert to USD (dynamic price)
  const TOTAL_SUPPLY = 1_000_000_000; // 1B total supply
  const marketCapUsd = price ? price * TOTAL_SUPPLY * solPriceUsd : null;

  // Calculate graduation progress (60 SOL threshold) - show 100% for graduated
  const realSol = Number(token.realSolReserves) / 1e9;
  const graduationThreshold = 60;
  const graduationProgress = token.graduated ? 100 : Math.min((realSol / graduationThreshold) * 100, 100);

  // Use metadata image or fallback
  const tokenImage = metadata?.image || token.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${mint}`;
  const tokenDescription = metadata?.description || token.description || 'No description available';
  const tokenName = token.name || 'Unknown Token';
  const tokenSymbol = token.symbol || 'UNK';
  const holders = token._count?.holders || 0;

  // Create token object for TradePanel
  // TradePanel needs a price for calculations - use Meteora price if available, otherwise bonding curve
  const tradeToken = {
    mint: token.mint,
    name: tokenName,
    symbol: tokenSymbol,
    price: price ?? bondingCurvePrice,
    virtualSolReserves: Number(token.virtualSolReserves),
    virtualTokenReserves: Number(token.virtualTokenReserves),
    graduated: token.graduated,
    meteoraPool: token.meteoraPool,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Token Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-light flex-shrink-0">
              <Image
                src={tokenImage}
                alt={tokenName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold">{tokenName}</h1>
                {token.graduated && (
                  <span className="flex items-center space-x-1 text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                    <Rocket className="w-3 h-3" />
                    <span>Graduated</span>
                  </span>
                )}
                {token.graduated && token.meteoraPool && (
                  <a
                    href={`https://app.meteora.ag/dlmm/${token.meteoraPool}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full hover:bg-blue-500/30 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Meteora</span>
                  </a>
                )}
              </div>
              <p className="text-xl text-gray-400">${tokenSymbol}</p>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={copyAddress}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-white transition-colors"
                >
                  <span>{shortenAddress(mint, 6)}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-primary-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={`https://solscan.io/token/${mint}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 mt-4">{tokenDescription}</p>

          {/* Social Links */}
          {token.socials && (
            <div className="flex items-center space-x-3 mt-4">
              {token.socials.twitter && (
                <a
                  href={token.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </a>
              )}
              {token.socials.telegram && (
                <a
                  href={token.socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Telegram</span>
                </a>
              )}
              {token.socials.website && (
                <a
                  href={token.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface rounded-xl border border-gray-800 p-4">
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-xl font-bold">
              {priceLoading ? <span className="text-gray-400">Loading...</span> : formatPrice(price || 0, solPriceUsd)}
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-gray-800 p-4">
            <p className="text-sm text-gray-500">Market Cap</p>
            <p className="text-xl font-bold">
              {priceLoading ? <span className="text-gray-400">Loading...</span> : `$${formatNumber(marketCapUsd || 0)}`}
            </p>
          </div>
          <div className="bg-surface rounded-xl border border-gray-800 p-4">
            <p className="text-sm text-gray-500">SOL Raised</p>
            <p className="text-xl font-bold">{realSol.toFixed(2)} SOL</p>
          </div>
          <div className="bg-surface rounded-xl border border-gray-800 p-4">
            <p className="text-sm text-gray-500">Holders</p>
            <p className="text-xl font-bold flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-400" />
              {holders}
            </p>
          </div>
        </div>
      </div>

      {/* Graduation Progress */}
      {!token.graduated && (
        <div className="bg-surface rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Graduation Progress</span>
            <span className="text-sm font-medium">
              {isGraduating ? (
                <span className="flex items-center text-primary-400">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Graduating to Meteora...
                </span>
              ) : (
                `${graduationProgress.toFixed(1)}% to Meteora`
              )}
            </span>
          </div>
          <div className="h-3 bg-surface-light rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGraduating 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-400 animate-pulse'
                  : 'bg-gradient-to-r from-primary-500 to-primary-400'
              }`}
              style={{ width: `${graduationProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isGraduating
              ? 'Creating Meteora DLMM pool and adding liquidity...'
              : `When ${graduationThreshold} SOL is raised, liquidity moves to Meteora`
            }
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart and History */}
        <div className="lg:col-span-2 space-y-6">
          <PriceChart mint={mint} />
          <TransactionHistory mint={mint} />
          <CommentSection mint={mint} />
        </div>

        {/* Trade Panel */}
        <div className="lg:col-span-1">
          <TradePanel token={tradeToken} onTradeSuccess={handleTradeSuccess} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>Created {formatTimeAgo(new Date(token.createdAt).getTime())}</span>
        </div>
        <div>
          <span>Creator: </span>
          <a
            href={`/profile/${token.creatorAddress}`}
            className="text-primary-400 hover:underline"
          >
            {shortenAddress(token.creatorAddress, 4)}
          </a>
        </div>
      </div>
    </div>
  );
};
