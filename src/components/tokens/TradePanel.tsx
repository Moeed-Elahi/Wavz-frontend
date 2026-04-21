'use client';

import { FC, useState, useMemo, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ArrowUpDown, Loader2, AlertTriangle, Rocket, ExternalLink, Zap } from 'lucide-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, getAccount } from '@solana/spl-token';
import toast from 'react-hot-toast';
import { formatNumber, formatPrice } from '@/lib/utils';
import { useLaunchpadActions } from '@/hooks/useProgram';
import { useMeteorSwap } from '@/hooks/useMeteorSwap';

interface Token {
  mint: string;
  name: string;
  symbol: string;
  price: number;
  virtualSolReserves: number;
  virtualTokenReserves: number;
  graduated: boolean;
  meteoraPool?: string;
}

interface TradePanelProps {
  token: Token;
  onTradeSuccess?: (update: { isBuy: boolean; solAmount: number; tokenAmount: number }) => void;
}

type TradeMode = 'buy' | 'sell';

export const TradePanel: FC<TradePanelProps> = ({ token, onTradeSuccess }) => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { buy, sell } = useLaunchpadActions();
  const { buyOnMeteora, sellOnMeteora, getQuote, getPoolInfo } = useMeteorSwap();
  
  const [mode, setMode] = useState<TradeMode>('buy');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slippage, setSlippage] = useState(1); // 1%
  const [userSolBalance, setUserSolBalance] = useState(0);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [meteoraQuote, setMeteoraQuote] = useState<{ outAmount: number; fee: number } | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [poolLiquidity, setPoolLiquidity] = useState<{ totalSol: number; totalTokens: number } | null>(null);
  const [poolRefreshKey, setPoolRefreshKey] = useState(0);

  // Check if trading on Meteora
  const isMeteoraTrading = token.graduated && !!token.meteoraPool;

  // Fetch pool liquidity info
  useEffect(() => {
    const fetchPoolInfo = async () => {
      if (!isMeteoraTrading || !token.meteoraPool) {
        setPoolLiquidity(null);
        return;
      }
      try {
        const info = await getPoolInfo(token.meteoraPool);
        setPoolLiquidity({ totalSol: info.totalSol, totalTokens: info.totalTokens });
      } catch (err) {
        console.error('Error fetching pool info:', err);
      }
    };
    fetchPoolInfo();
  }, [isMeteoraTrading, token.meteoraPool, getPoolInfo, poolRefreshKey]);

  // Fetch real balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey || !connected) return;
      
      try {
        // Get SOL balance
        const solBalance = await connection.getBalance(publicKey);
        setUserSolBalance(solBalance / LAMPORTS_PER_SOL);
        
        // Get token balance
        try {
          const mintPubkey = new PublicKey(token.mint);
          const ata = getAssociatedTokenAddressSync(mintPubkey, publicKey);
          const tokenAccount = await getAccount(connection, ata);
          setUserTokenBalance(Number(tokenAccount.amount) / 1e6); // 6 decimals
        } catch {
          setUserTokenBalance(0);
        }
      } catch (err) {
        console.error('Error fetching balances:', err);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 5000);
    return () => clearInterval(interval);
  }, [publicKey, connected, connection, token.mint]);

  // Fetch Meteora quote when trading on graduated token
  useEffect(() => {
    const fetchMeteoraQuote = async () => {
      if (!isMeteoraTrading || !token.meteoraPool) {
        setMeteoraQuote(null);
        setQuoteError(null);
        return;
      }

      const inputAmount = parseFloat(amount) || 0;
      if (inputAmount <= 0) {
        setMeteoraQuote(null);
        setQuoteError(null);
        return;
      }

      try {
        const amountInSmallestUnit = mode === 'buy' 
          ? Math.floor(inputAmount * LAMPORTS_PER_SOL) // SOL to lamports
          : Math.floor(inputAmount * 1e6); // Token amount

        const quote = await getQuote(token.meteoraPool, amountInSmallestUnit, mode === 'buy');
        setMeteoraQuote({
          outAmount: quote.outAmount,
          fee: quote.fee,
        });
        setQuoteError(null);
      } catch (err: any) {
        console.error('Error fetching Meteora quote:', err);
        setMeteoraQuote(null);
        if (err.message?.includes('Insufficient liquidity')) {
          // Calculate max recommended based on pool liquidity (10% of pool for low impact)
          const maxRecommended = poolLiquidity 
            ? mode === 'buy' 
              ? Math.floor(poolLiquidity.totalSol * 0.1 * 100) / 100
              : Math.floor(poolLiquidity.totalTokens * 0.1)
            : null;
          const maxStr = maxRecommended 
            ? ` Max recommended: ${maxRecommended} ${mode === 'buy' ? 'SOL' : token.symbol}`
            : '';
          setQuoteError(`Insufficient liquidity. Try a smaller amount.${maxStr}`);
        } else {
          setQuoteError('Could not get quote. Try a smaller amount.');
        }
      }
    };

    const debounce = setTimeout(fetchMeteoraQuote, 300);
    return () => clearTimeout(debounce);
  }, [amount, mode, isMeteoraTrading, token.meteoraPool, token.symbol, getQuote, poolLiquidity]);

  // Platform fee (1% = 100 bps) - only for bonding curve
  const PLATFORM_FEE_BPS = 100;

  // Calculate output based on bonding curve OR Meteora
  const outputAmount = useMemo(() => {
    const inputAmount = parseFloat(amount) || 0;
    if (inputAmount <= 0) return 0;

    // Use Meteora quote if trading on graduated token
    if (isMeteoraTrading && meteoraQuote) {
      return mode === 'buy' 
        ? meteoraQuote.outAmount / 1e6  // Token decimals
        : meteoraQuote.outAmount / LAMPORTS_PER_SOL; // SOL
    }

    // Bonding curve calculation
    if (mode === 'buy') {
      // Calculate tokens out for SOL input (after fee deduction)
      // dy = y * dx / (x + dx)
      const dx = inputAmount * 1e9; // Convert SOL to lamports
      const fee = (dx * PLATFORM_FEE_BPS) / 10000;
      const dxAfterFee = dx - fee;
      const tokens = (token.virtualTokenReserves * dxAfterFee) / 
        (token.virtualSolReserves + dxAfterFee);
      return tokens / 1e6; // Convert to token decimals
    } else {
      // Calculate SOL out for token input (fee deducted from output)
      // dx = x * dy / (y + dy)
      const dy = inputAmount * 1e6; // Convert to token decimals
      const solBeforeFee = (token.virtualSolReserves * dy) / 
        (token.virtualTokenReserves + dy);
      const fee = (solBeforeFee * PLATFORM_FEE_BPS) / 10000;
      return (solBeforeFee - fee) / 1e9; // Convert lamports to SOL
    }
  }, [amount, mode, token, isMeteoraTrading, meteoraQuote]);

  // Price impact calculation
  const priceImpact = useMemo(() => {
    const inputAmount = parseFloat(amount) || 0;
    if (inputAmount <= 0 || outputAmount <= 0) return 0;

    const currentPrice = token.virtualSolReserves / token.virtualTokenReserves;
    const newPrice = mode === 'buy'
      ? (token.virtualSolReserves + inputAmount * 1e9) / 
        (token.virtualTokenReserves - outputAmount * 1e6)
      : (token.virtualSolReserves - outputAmount * 1e9) / 
        (token.virtualTokenReserves + inputAmount * 1e6);
    
    return Math.abs((newPrice - currentPrice) / currentPrice) * 100;
  }, [amount, outputAmount, mode, token]);

  const handleTrade = async () => {
    // Prevent double-clicks
    if (isSubmitting) return;
    
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    const inputAmount = parseFloat(amount);
    if (!inputAmount || inputAmount <= 0) {
      toast.error('Please enter an amount');
      return;
    }

    if (mode === 'buy' && inputAmount > userSolBalance) {
      toast.error('Insufficient SOL balance');
      return;
    }

    if (mode === 'sell' && inputAmount > userTokenBalance) {
      toast.error('Insufficient token balance');
      return;
    }

    setIsSubmitting(true);

    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      attempt++;
      
      try {
        const tradingVenue = isMeteoraTrading ? 'Meteora' : 'bonding curve';
        toast.loading(
          `${mode === 'buy' ? 'Buying' : 'Selling'} on ${tradingVenue}...${attempt > 1 ? ` (attempt ${attempt}/${maxRetries})` : ''}`, 
          { id: 'trade' }
        );

        const slippageBps = slippage * 100; // Convert percentage to basis points
        let signature: string | undefined;
        
        if (isMeteoraTrading && token.meteoraPool) {
          // Trade on Meteora
          if (mode === 'buy') {
            const solAmountLamports = Math.floor(inputAmount * LAMPORTS_PER_SOL);
            signature = await buyOnMeteora(token.meteoraPool, token.mint, solAmountLamports, slippageBps);
          } else {
            const tokenAmountWithDecimals = Math.floor(inputAmount * 1e6);
            signature = await sellOnMeteora(token.meteoraPool, token.mint, tokenAmountWithDecimals, slippageBps);
          }
          
          // Record Meteora trade to backend for chart/history (AWAIT to ensure real-time update)
          if (signature && publicKey) {
            const solAmountLamports = mode === 'buy' 
              ? Math.floor(inputAmount * LAMPORTS_PER_SOL)
              : Math.floor(outputAmount * LAMPORTS_PER_SOL);
            const tokenAmountRaw = mode === 'buy'
              ? Math.floor(outputAmount * 1e6)
              : Math.floor(inputAmount * 1e6);
            const price = mode === 'buy'
              ? (inputAmount * LAMPORTS_PER_SOL) / (outputAmount * 1e6)
              : (outputAmount * LAMPORTS_PER_SOL) / (inputAmount * 1e6);
              
            try {
              // Wait for backend to record trade and emit WebSocket event
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/trades/meteora`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  signature,
                  mint: token.mint,
                  userAddress: publicKey.toBase58(),
                  isBuy: mode === 'buy',
                  solAmount: solAmountLamports.toString(),
                  tokenAmount: tokenAmountRaw.toString(),
                  price,
                }),
              });
              
              if (!res.ok) {
                console.error('Failed to record trade:', await res.text());
              } else {
                console.log('✅ Meteora trade recorded successfully');
              }
            } catch (err) {
              console.error('Failed to record Meteora trade:', err);
            }
          }
        } else {
          // Trade on bonding curve
          if (mode === 'buy') {
            const solAmountLamports = Math.floor(inputAmount * LAMPORTS_PER_SOL);
            await buy(token.mint, solAmountLamports, slippageBps);
          } else {
            const tokenAmountWithDecimals = Math.floor(inputAmount * 1e6);
            await sell(token.mint, tokenAmountWithDecimals, slippageBps);
          }
        }

        toast.success(
          `${mode === 'buy' ? 'Bought' : 'Sold'} ${formatNumber(outputAmount)} ${
            mode === 'buy' ? token.symbol : 'SOL'
          }${isMeteoraTrading ? ' on Meteora' : ''}`,
          { id: 'trade' }
        );

        // Refresh pool liquidity after Meteora trade
        if (isMeteoraTrading) {
          setPoolRefreshKey(k => k + 1);
        }

        // Optimistic update for bonding curve trades
        if (!isMeteoraTrading && onTradeSuccess) {
          const solLamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
          const tokenRaw = Math.floor(outputAmount * 1e6);
          onTradeSuccess({
            isBuy: mode === 'buy',
            solAmount: mode === 'buy' ? solLamports : Math.floor(outputAmount * LAMPORTS_PER_SOL),
            tokenAmount: mode === 'buy' ? tokenRaw : Math.floor(parseFloat(amount) * 1e6),
          });
        }

        setAmount('');
        setIsSubmitting(false);
        return; // Success - exit loop
        
      } catch (error: any) {
        lastError = error;
        console.error(`Trade error (attempt ${attempt}):`, error);
        console.error('Error message:', error?.message);
        
        // Handle "already processed" as success
        if (error?.message?.includes('already been processed') || 
            error?.message?.includes('AlreadyProcessed')) {
          toast.success(
            `${mode === 'buy' ? 'Bought' : 'Sold'} ${formatNumber(outputAmount)} ${
              mode === 'buy' ? token.symbol : 'SOL'
            }`,
            { id: 'trade' }
          );
          if (isMeteoraTrading) setPoolRefreshKey(k => k + 1);
          setAmount('');
          setIsSubmitting(false);
          return;
        }
        
        // Handle timeout errors - retry automatically
        if (error?.message?.includes('Transaction was not confirmed') || 
            error?.message?.includes('TransactionExpiredTimeoutError') ||
            error?.message?.includes('timeout') ||
            error?.message?.includes('blockhash')) {
          
          if (attempt < maxRetries) {
            toast.loading(`Transaction timed out. Retrying... (${attempt + 1}/${maxRetries})`, { id: 'trade' });
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
            continue; // Retry
          }
        }
        
        // Non-retryable error or max retries reached
        break;
      }
    }
    
    // All retries failed
    const errorMsg = lastError?.message || 'Transaction failed';
    if (errorMsg.includes('timeout') || errorMsg.includes('not confirmed')) {
      toast.error(
        'Transaction timed out after multiple attempts. Please try again or use smaller amounts.',
        { id: 'trade', duration: 5000 }
      );
    } else {
      toast.error(errorMsg.substring(0, 100), { id: 'trade' });
    }
    setIsSubmitting(false);
  };

  const handleMaxClick = () => {
    if (mode === 'buy') {
      // Leave some SOL for fees
      setAmount(Math.max(0, userSolBalance - 0.01).toFixed(4));
    } else {
      setAmount(userTokenBalance.toString());
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-gray-800 p-4 sticky top-24">
      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-surface-light p-1 mb-4">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 rounded-md font-medium transition-colors ${
            mode === 'buy'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 rounded-md font-medium transition-colors ${
            mode === 'sell'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">
              {mode === 'buy' ? 'You Pay' : 'You Sell'}
            </label>
            <span className="text-sm text-gray-500">
              Balance: {mode === 'buy' 
                ? `${userSolBalance.toFixed(4)} SOL`
                : `${formatNumber(userTokenBalance)} ${token.symbol}`
              }
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-field pr-20 text-lg"
              disabled={isSubmitting}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button
                onClick={handleMaxClick}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                MAX
              </button>
              <span className="text-gray-400">
                {mode === 'buy' ? 'SOL' : token.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="bg-surface-light rounded-full p-2">
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Output */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">
            {mode === 'buy' ? 'You Receive' : 'You Get'}
          </label>
          <div className="bg-surface-light rounded-lg px-4 py-3 text-lg">
            <span className="text-white">
              {outputAmount > 0 ? formatNumber(outputAmount) : '0.00'}
            </span>
            <span className="text-gray-400 ml-2">
              {mode === 'buy' ? token.symbol : 'SOL'}
            </span>
          </div>
        </div>

        {/* Trade Info */}
        {parseFloat(amount) > 0 && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Price Impact</span>
              <span
                className={
                  priceImpact > 5
                    ? 'text-red-500'
                    : priceImpact > 2
                    ? 'text-yellow-500'
                    : 'text-gray-400'
                }
              >
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Slippage Tolerance</span>
              <span className="text-gray-400">{slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trading On</span>
              <span className={isMeteoraTrading ? 'text-purple-400' : 'text-primary-400'}>
                {isMeteoraTrading ? 'Meteora DLMM' : 'Bonding Curve'}
              </span>
            </div>
            {!isMeteoraTrading && (
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee</span>
                <span className="text-gray-400">1%</span>
              </div>
            )}
          </div>
        )}

        {/* High Price Impact Warning */}
        {priceImpact > 5 && (
          <div className="flex items-start space-x-2 text-yellow-500 bg-yellow-500/10 rounded-lg p-3 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>
              High price impact! Consider trading a smaller amount.
            </span>
          </div>
        )}

        {/* Quote Error Warning - Insufficient Liquidity */}
        {quoteError && isMeteoraTrading && (
          <div className="flex items-start space-x-2 text-red-400 bg-red-500/10 rounded-lg p-3 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{quoteError}</span>
          </div>
        )}

        {/* Meteora Trading Badge */}
        {isMeteoraTrading && (
          <div className="text-sm bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">Trading on Meteora DLMM</span>
              </div>
              <a
                href={`https://app.meteora.ag/dlmm/${token.meteoraPool}`}
                target="_blank"
                rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span className="text-xs">View Pool</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            </div>
            {poolLiquidity && (
              <div className="mt-2 pt-2 border-t border-purple-500/20 text-xs text-gray-400">
                Pool Liquidity: {formatNumber(poolLiquidity.totalSol)} SOL / {formatNumber(poolLiquidity.totalTokens)} {token.symbol}
              </div>
            )}
          </div>
        )}

        {/* Token Graduated but no pool yet */}
        {token.graduated && !token.meteoraPool && (
          <div className="flex items-start space-x-2 text-yellow-400 bg-yellow-500/10 rounded-lg p-3 text-sm">
            <Rocket className="w-5 h-5 flex-shrink-0" />
            <span>
              This token has graduated! Meteora pool creation is pending. Check back soon.
            </span>
          </div>
        )}

        {/* Trade Button - Show for all tradeable tokens */}
        {(!token.graduated || (token.graduated && token.meteoraPool)) && (
          <button
            onClick={handleTrade}
            disabled={isSubmitting || !connected}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
              isMeteoraTrading
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                : mode === 'buy'
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : !connected ? (
            <span>Connect Wallet</span>
          ) : (
            <>
              {isMeteoraTrading && <Zap className="w-4 h-4" />}
              <span>{mode === 'buy' ? 'Buy' : 'Sell'} {token.symbol}</span>
            </>
          )}
        </button>
        )}
      </div>

      {/* Slippage Settings */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Slippage Tolerance</span>
        </div>
        <div className="flex items-center space-x-2">
          {[0.5, 1, 2, 5].map((value) => (
            <button
              key={value}
              onClick={() => setSlippage(value)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                slippage === value
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-light text-gray-400 hover:text-white'
              }`}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
