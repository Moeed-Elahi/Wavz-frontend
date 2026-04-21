// Type declarations for modules without types

declare module '@solana/wallet-adapter-react-ui/styles.css';

// Fix React 18 JSX compatibility with wallet adapter
declare module '@solana/wallet-adapter-react' {
  import { FC, ReactNode } from 'react';
  import { Connection, PublicKey } from '@solana/web3.js';
  import { Adapter, WalletName } from '@solana/wallet-adapter-base';

  export interface ConnectionProviderProps {
    children: ReactNode;
    endpoint: string;
    config?: any;
  }

  export interface WalletProviderProps {
    children: ReactNode;
    wallets: Adapter[];
    autoConnect?: boolean;
    onError?: (error: Error) => void;
    localStorageKey?: string;
  }

  export const ConnectionProvider: FC<ConnectionProviderProps>;
  export const WalletProvider: FC<WalletProviderProps>;

  export function useConnection(): { connection: Connection };
  export function useWallet(): {
    publicKey: PublicKey | null;
    wallet: any;
    wallets: any[];
    connected: boolean;
    connecting: boolean;
    disconnecting: boolean;
    select: (walletName: WalletName) => void;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    sendTransaction: (...args: any[]) => Promise<string>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  };
  export function useAnchorWallet(): any;
}

declare module '@solana/wallet-adapter-react-ui' {
  import { FC, ReactNode } from 'react';

  export interface WalletModalProviderProps {
    children: ReactNode;
  }

  export const WalletModalProvider: FC<WalletModalProviderProps>;
  export const WalletMultiButton: FC<any>;
  export const WalletDisconnectButton: FC<any>;
}
