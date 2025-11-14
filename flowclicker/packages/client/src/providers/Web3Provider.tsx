import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId, metadata, supportedChains } from '../lib/web3/config';

// Create Query Client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 30_000, // 30 seconds
    },
  },
});

// Create Web3Modal instance
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#8b5cf6', // Primary purple
    '--w3m-border-radius-master': '8px',
  },
  enableAnalytics: true, // Optional: track wallet usage
  enableOnramp: false, // Disable fiat on-ramp (not needed for game)
  chains: supportedChains as any, // Type assertion for compatibility
  featuredWalletIds: [
    // Prioritize these wallets in the modal
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Ledger Live
  ],
});

interface Web3ProviderProps {
  children: ReactNode;
}

/**
 * Web3Provider Component
 * Wraps the app with Wagmi and Web3Modal for wallet connectivity
 *
 * Features:
 * - 300+ wallet support via WalletConnect
 * - Multi-chain support (ANDE, Polygon, Arbitrum, etc.)
 * - Dark theme matching game design
 * - Mobile-optimized (QR code + deep links)
 * - Auto-reconnect
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
