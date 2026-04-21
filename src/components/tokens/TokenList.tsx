'use client';

import { FC, useState, useEffect } from 'react';
import { TokenCard } from './TokenCard';
import { Search, Filter, TrendingUp, Clock, Flame, Loader2 } from 'lucide-react';
import { useTokens, Token } from '@/hooks/useApi';
import { useSocket } from '@/components/providers/SocketProvider';
import toast from 'react-hot-toast';

type SortOption = 'trending' | 'newest' | 'marketCap' | 'volume';

const sortFieldMap: Record<SortOption, string> = {
  trending: 'priceChange24h',
  newest: 'createdAt',
  marketCap: 'marketCap',
  volume: 'volume24h',
};

export const TokenList: FC = () => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [showGraduated, setShowGraduated] = useState(true);
  const [page, setPage] = useState(1);
  const [newTokens, setNewTokens] = useState<Token[]>([]);

  const { socket, subscribeToFeed, unsubscribeFromFeed, connected } = useSocket();

  const { data, isLoading, error, refetch } = useTokens({
    page,
    limit: 20,
    sort: sortFieldMap[sortBy],
    order: 'desc',
    graduated: showGraduated ? undefined : false,
    search: search || undefined,
  });

  // Subscribe to real-time feed
  useEffect(() => {
    if (!socket || !connected) return;

    subscribeToFeed();

    // Handle new token created
    const handleNewToken = (token: Token) => {
      console.log('🆕 New token created:', token.name);
      toast.success(`New token: ${token.name} ($${token.symbol})`, {
        icon: '🚀',
        duration: 4000,
      });
      
      // Add to top of list if on page 1
      if (page === 1 && sortBy === 'newest') {
        setNewTokens(prev => [token, ...prev].slice(0, 5));
      }
      // Always refetch to update counts
      refetch();
    };

    // Handle token graduated
    const handleGraduated = (data: { mint: string }) => {
      console.log('🎓 Token graduated:', data.mint);
      refetch();
    };

    socket.on('token:created', handleNewToken);
    socket.on('token:graduated', handleGraduated);

    return () => {
      unsubscribeFromFeed();
      socket.off('token:created', handleNewToken);
      socket.off('token:graduated', handleGraduated);
    };
  }, [socket, connected, subscribeToFeed, unsubscribeFromFeed, page, sortBy, refetch]);

  // Clear new tokens when data changes
  useEffect(() => {
    setNewTokens([]);
  }, [data]);

  const tokens = data?.tokens || [];
  const pagination = data?.pagination;

  // Merge new tokens with fetched tokens (avoid duplicates)
  const displayTokens = [...newTokens.filter(nt => !tokens.some(t => t.mint === nt.mint)), ...tokens];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load tokens</p>
        <button
          onClick={() => refetch()}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div id="tokens" className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Sort options */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortBy('trending')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              sortBy === 'trending'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-light text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              sortBy === 'newest'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-light text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>New</span>
          </button>
          <button
            onClick={() => setSortBy('marketCap')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              sortBy === 'marketCap'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-light text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Market Cap</span>
          </button>
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowGraduated(!showGraduated)}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors ${
            showGraduated
              ? 'border-primary-500 text-primary-500'
              : 'border-gray-700 text-gray-400'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Graduated</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Token Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayTokens.map((token) => (
            <TokenCard key={token.mint} token={token} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination && pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-gray-400">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {!isLoading && displayTokens.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No tokens found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
