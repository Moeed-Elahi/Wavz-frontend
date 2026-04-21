'use client';

import { FC } from 'react';
import { Coins, Users, TrendingUp, Rocket, Loader2 } from 'lucide-react';
import { useVolumeStats, useTokens } from '@/hooks/useApi';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLoading?: boolean;
}

const StatItem: FC<StatItemProps> = ({ icon, label, value, isLoading }) => (
  <div className="flex items-center space-x-3 bg-surface rounded-xl border border-gray-800 px-4 py-3">
    <div className="text-primary-500">{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      ) : (
        <p className="text-lg font-semibold">{value}</p>
      )}
    </div>
  </div>
);

export const StatsBar: FC = () => {
  const { data: volumeData, isLoading: volumeLoading } = useVolumeStats('24h');
  const { data: allTokens, isLoading: tokensLoading } = useTokens({ limit: 1 });
  const { data: graduatedTokens, isLoading: graduatedLoading } = useTokens({ graduated: true, limit: 1 });

  const formatSOL = (lamports: number) => {
    const sol = lamports / 1_000_000_000;
    if (sol >= 1000000) return `${(sol / 1000000).toFixed(1)}M SOL`;
    if (sol >= 1000) return `${(sol / 1000).toFixed(1)}K SOL`;
    return `${sol.toFixed(2)} SOL`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatItem
        icon={<Coins className="w-5 h-5" />}
        label="Tokens Created"
        value={allTokens?.pagination?.total?.toLocaleString() || '0'}
        isLoading={tokensLoading}
      />
      <StatItem
        icon={<TrendingUp className="w-5 h-5" />}
        label="24h Volume"
        value={volumeData ? formatSOL(volumeData.totalVolume) : '0 SOL'}
        isLoading={volumeLoading}
      />
      <StatItem
        icon={<Users className="w-5 h-5" />}
        label="24h Trades"
        value={volumeData?.tradeCount?.toLocaleString() || '0'}
        isLoading={volumeLoading}
      />
      <StatItem
        icon={<Rocket className="w-5 h-5" />}
        label="Graduated"
        value={graduatedTokens?.pagination?.total?.toLocaleString() || '0'}
        isLoading={graduatedLoading}
      />
    </div>
  );
};
