'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './SocketProvider';
import { GatewayProvider } from '@civic/solana-gateway-react';

// @ts-ignore - wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Civic Identity Gateway Network for mainnet
// ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6 is Civic Liveness Pass
const CIVIC_GATEKEEPER_NETWORK = new PublicKey(
  process.env.NEXT_PUBLIC_CIVIC_GATEKEEPER_NETWORK || 
  'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6'
);

// Check if we're on mainnet (Civic only enabled on mainnet)
const isMainnet = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || '';
  // Explicit check: must contain mainnet AND not contain devnet
  const hasMainnet = rpcUrl.includes('mainnet');
  const hasDevnet = rpcUrl.includes('devnet');
  return hasMainnet && !hasDevnet;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

// Inner component that has access to wallet context
// Civic verification only enabled on mainnet
const CivicGatewayWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  // Skip Civic on devnet - only use on mainnet
  if (!isMainnet()) {
    return <>{children}</>;
  }

  // Only wrap with GatewayProvider if wallet is connected (mainnet only)
  if (!wallet.publicKey) {
    return <>{children}</>;
  }

  return (
    <GatewayProvider
      wallet={wallet}
      connection={connection}
      gatekeeperNetwork={CIVIC_GATEKEEPER_NETWORK}
      cluster="mainnet-beta"
      options={{ autoShowModal: false }}
    >
      {children}
    </GatewayProvider>
  );
};

export const Providers: FC<ProvidersProps> = ({ children }) => {
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('devnet');
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <CivicGatewayWrapper>
              <SocketProvider>
                {children}
              </SocketProvider>
            </CivicGatewayWrapper>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
};
