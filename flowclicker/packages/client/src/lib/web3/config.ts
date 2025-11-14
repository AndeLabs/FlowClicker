import { http, createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

// ANDE Network custom chain
export const andeNetwork = {
  id: 6174,
  name: 'ANDE Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ande.network'],
    },
    public: {
      http: ['https://rpc.ande.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ANDE Explorer',
      url: 'https://explorer.ande.network',
    },
  },
  testnet: false,
} as const;

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
// For production, you MUST create your own project
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

if (projectId === 'YOUR_PROJECT_ID_HERE') {
  console.warn(
    '⚠️  WalletConnect Project ID not set. Get one at https://cloud.walletconnect.com/'
  );
}

// Metadata for your app
const metadata = {
  name: 'FlowClicker',
  description: 'Full Onchain Clicker Game - Earn $FLOW tokens with each click',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://flowclicker.com',
  icons: [
    typeof window !== 'undefined'
      ? `${window.location.origin}/icons/icon-192x192.png`
      : 'https://flowclicker.com/icons/icon-192x192.png',
  ],
};

// Supported chains - Add/remove as needed
export const supportedChains = [
  andeNetwork, // Primary chain
  polygon, // Layer 2 with low fees
  arbitrum, // Layer 2 alternative
  optimism, // Layer 2 alternative
  base, // Coinbase L2
  mainnet, // Ethereum mainnet (fallback)
] as const;

// Wagmi configuration
export const config = createConfig({
  chains: supportedChains,
  transports: {
    [andeNetwork.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    // WalletConnect - 300+ wallets (MetaMask Mobile, Trust, Rainbow, etc.)
    walletConnect({
      projectId,
      metadata,
      showQrModal: true,
    }),

    // Injected wallet (MetaMask browser extension, Coinbase Wallet, etc.)
    injected({
      shimDisconnect: true,
    }),

    // Coinbase Wallet
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
  ssr: false, // We're building a SPA, not SSR
});

// Export for easier access
export { projectId, metadata };
