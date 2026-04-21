'use client';

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Rocket, Plus, User, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/components/providers/SocketProvider';

export const Navbar: FC = () => {
  const { publicKey } = useWallet();
  const { connected } = useSocket();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="border-b border-gray-800 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Rocket className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold gradient-text">LaunchPad</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Explore</span>
            </Link>
            <Link
              href="/create"
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Create Token</span>
            </Link>
            {mounted && publicKey && (
              <Link
                href={`/profile/${publicKey.toBase58()}`}
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            )}
          </div>

          {/* Wallet Button and Status */}
          <div className="flex items-center space-x-4">
            {/* Real-time connection indicator */}
            {mounted && (
              <div className="flex items-center space-x-1" title={connected ? 'Real-time connected' : 'Connecting...'}>
                {connected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-500 animate-pulse" />
                )}
                <span className={`text-xs ${connected ? 'text-green-500' : 'text-gray-500'}`}>
                  {connected ? 'Live' : '...'}
                </span>
              </div>
            )}
            {mounted && (
              <WalletMultiButton className="!bg-primary-500 hover:!bg-primary-600 !rounded-lg !py-2 !px-4 !text-sm !font-medium !transition-all" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
