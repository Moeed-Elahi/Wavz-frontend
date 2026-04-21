'use client';
import Image from 'next/image'
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Rocket, Plus, User, TrendingUp, Wifi, WifiOff, Search } from 'lucide-react';
import { useSocket } from '@/components/providers/SocketProvider';

export const Navbar: FC = () => {
  const { publicKey } = useWallet();
  const { connected } = useSocket();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50" style={{backgroundColor:'#08172A'}}>
      <div className="container mx-auto px-4">
       <div className="flex items-center justify-between h-16">
  
  {/* LEFT SIDE (Logo + Nav together) */}
  <div className="flex items-center space-x-8">
    
    {/* Logo */}
    <Image 
      src="/images/logo.png" 
      alt="logo" 
      width={150} 
      height={100} 
    />

    {/* Navigation */}
    <div className="hidden md:flex items-center space-x-6">
      <Link
        href="/"
        className="text-white hover:text-white transition-colors flex items-center space-x-1"
      >
        <span>Home</span>
      </Link>

      <Link
        href="/#"
        className="text-white hover:text-white transition-colors flex items-center space-x-1"
      >
        <span>GitBook</span>
      </Link>
      <Link
        href="/#"
        className="text-white hover:text-white transition-colors flex items-center space-x-1"
      >
        <span>How it Works</span>
      </Link>
      {/* {mounted && publicKey && (
        <Link
          href={`/profile/${publicKey.toBase58()}`}
          className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>
      )} */}
    </div>

  </div>

{/* RIGHT SIDE */}
<div className="flex items-center space-x-4">

  {/* SEARCH BAR */}
<div className="relative hidden md:block w-[360px]">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />

  <input
    type="text"
    placeholder="Search tokens..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full h-11 pl-10 pr-4 text-sm text-white placeholder-[#ffffff9d] outline-none"
    style={{
      backgroundColor: '#08172A',
      border: '1px solid #34557D',
      borderRadius: '12px',
    
    }}
  />
</div>

  {/* CREATE BUTTON */}

            <Link
              href="/create"
              className="btn-primary flex items-center space-x-2 text-lg px-6 py-3" style={{backgroundColor:'#FE9216',borderRadius:'14px'}}
            >
              <Plus className="w-6 h-6" />
              <span>Create Token</span>
            </Link>
    {/* {mounted && (
      <div className="flex items-center space-x-1">
        {connected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-500 animate-pulse" />
        )}
        <span className={`text-xs ${connected ? 'text-green-500' : 'text-gray-500'}`}>
          {connected ? 'Live' : '...'}
        </span>
      </div>
    )} */}

    {mounted && (
  <div className="relative">
    <WalletMultiButton
      className={`!h-11 !rounded-xl ${
        publicKey ? '!px-4' : '!pl-11 !pr-5'
      } !bg-primary-500 hover:!bg-primary-600 !text-sm !font-medium`}
    />

    {/* ICON ONLY WHEN NOT CONNECTED */}
    {!publicKey && (
      <img
        src="/images/wallet.png"
        alt="wallet"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
      />
    )}
  </div>
)}

</div>

</div>
      </div>
    </nav>
  );
};
