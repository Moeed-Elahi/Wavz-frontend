'use client';

import { useParams } from 'next/navigation';
import { useUser, useUserTrades, Token } from '@/hooks/useApi';
import { Loader2, Wallet, Coins, TrendingUp, ArrowUpRight, ArrowDownLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { CivicVerification } from '@/components/civic/CivicVerification';

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const wallet = useWallet();
  const isOwnProfile = wallet.publicKey?.toBase58() === address;
  
  const { data: user, isLoading: userLoading, error: userError } = useUser(address);
  const { data: tradesData, isLoading: tradesLoading } = useUserTrades(address, 1, 20);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-400">Failed to load profile</p>
      </div>
    );
  }

  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-surface rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{shortAddress}</h1>
            <a
              href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-400 flex items-center space-x-1 text-sm"
            >
              <span>View on Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <Coins className="w-4 h-4" />
              <span>Tokens Created</span>
            </div>
            <p className="text-xl font-bold text-white">{user?._count?.tokensCreated || 0}</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Total Trades</span>
            </div>
            <p className="text-xl font-bold text-white">{user?._count?.trades || 0}</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <Wallet className="w-4 h-4" />
              <span>Holdings</span>
            </div>
            <p className="text-xl font-bold text-white">{user?.holdings?.length || 0}</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <Coins className="w-4 h-4" />
              <span>Trust Score</span>
            </div>
            <p className="text-xl font-bold text-white">{user?.trustScore || 50}</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Civic Status</span>
            </div>
            <p className={`text-xl font-bold ${user?.civicVerified ? 'text-green-400' : 'text-gray-500'}`}>
              {user?.civicVerified ? 'Verified' : 'Not Verified'}
            </p>
          </div>
        </div>
        
        {/* Civic Verification Card - only show for own profile */}
        {isOwnProfile && (
          <div className="mt-6">
            <CivicVerification />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Holdings */}
        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Token Holdings</h2>
          {user?.holdings?.length > 0 ? (
            <div className="space-y-3">
              {user.holdings.map((holding: { token: Token; balance: string }) => (
                <Link
                  key={holding.token.mint}
                  href={`/token/${holding.token.mint}`}
                  className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {holding.token.image ? (
                      <img
                        src={holding.token.image}
                        alt={holding.token.symbol}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500" />
                    )}
                    <div>
                      <p className="font-medium text-white">{holding.token.symbol}</p>
                      <p className="text-sm text-gray-400">{holding.token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {(Number(holding.balance) / 1e6).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">tokens</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No holdings yet</p>
          )}
        </div>

        {/* Recent Trades */}
        <div className="bg-surface rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Trades</h2>
          {tradesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : tradesData?.trades?.length > 0 ? (
            <div className="space-y-3">
              {tradesData.trades.map((trade: {
                id: string;
                isBuy: boolean;
                solAmount: string | number;
                tokenAmount: string | number;
                timestamp: string;
                signature: string;
                token?: Token;
              }) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${trade.isBuy ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {trade.isBuy ? (
                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {trade.isBuy ? 'Buy' : 'Sell'} {trade.token?.symbol || 'Token'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(trade.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${trade.isBuy ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.isBuy ? '+' : '-'}{(Number(trade.tokenAmount) / 1e6).toLocaleString()} tokens
                    </p>
                    <p className="text-sm text-gray-400">
                      {(Number(trade.solAmount) / 1e9).toFixed(4)} SOL
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No trades yet</p>
          )}
        </div>
      </div>

      {/* Tokens Created */}
      {user?.tokensCreated?.length > 0 && (
        <div className="bg-surface rounded-xl p-6 mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Tokens Created</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.tokensCreated.map((token: Token) => (
              <Link
                key={token.mint}
                href={`/token/${token.mint}`}
                className="flex items-center space-x-3 p-4 bg-background rounded-lg hover:bg-gray-800 transition-colors"
              >
                {token.image ? (
                  <img
                    src={token.image}
                    alt={token.symbol}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500" />
                )}
                <div>
                  <p className="font-medium text-white">{token.symbol}</p>
                  <p className="text-sm text-gray-400">{token.name}</p>
                  <p className="text-xs text-primary-400">
                    ${token.marketCap?.toLocaleString() || '0'} MC
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
