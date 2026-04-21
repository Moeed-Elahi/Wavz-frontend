'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Rocket, Zap, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900/20 via-surface to-surface border border-gray-800">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
      
      <div className="relative px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Launch Your Token in
            <span className="gradient-text"> Seconds</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl"
          >
            Create and trade tokens with a fair bonding curve. 
            No presale, no team allocation. Just launch and let the community decide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/create"
              className="btn-primary flex items-center space-x-2 text-lg px-6 py-3"
            >
              <Rocket className="w-5 h-5" />
              <span>Create Token</span>
            </Link>
            <Link
              href="#tokens"
              className="btn-secondary flex items-center space-x-2 text-lg px-6 py-3"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Explore Tokens</span>
            </Link>
          </motion.div>
        </div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mt-12"
        >
          <div className="flex items-center space-x-2 bg-surface-light/50 backdrop-blur px-4 py-2 rounded-full border border-gray-700">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-300">Instant Launch</span>
          </div>
          <div className="flex items-center space-x-2 bg-surface-light/50 backdrop-blur px-4 py-2 rounded-full border border-gray-700">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-300">No Rug Pulls</span>
          </div>
          <div className="flex items-center space-x-2 bg-surface-light/50 backdrop-blur px-4 py-2 rounded-full border border-gray-700">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-gray-300">Fair Bonding Curve</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
