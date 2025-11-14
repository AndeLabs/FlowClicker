import { Wallet, ChevronDown, Check, ExternalLink } from 'lucide-react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '../ui/Button';
import { formatAddress } from '../../lib/formatters';
import { andeNetwork, supportedChains } from '../../lib/web3/config';
import { useState } from 'react';

/**
 * ConnectWallet Component
 * Real wallet connection using WalletConnect v2 + Wagmi
 *
 * Features:
 * - 300+ wallets via WalletConnect
 * - QR code for mobile
 * - Deep links to wallet apps
 * - Multi-chain support
 * - Auto-reconnect
 */
export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { open } = useWeb3Modal();
  const [showChainMenu, setShowChainMenu] = useState(false);

  const handleConnect = async () => {
    await open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSwitchChain = (chainId: number) => {
    switchChain({ chainId });
    setShowChainMenu(false);
  };

  // Check if on correct chain
  const isOnAndeNetwork = chain?.id === andeNetwork.id;
  const needsChainSwitch = isConnected && !isOnAndeNetwork;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {/* Chain Selector */}
        <div className="relative">
          <button
            onClick={() => setShowChainMenu(!showChainMenu)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              isOnAndeNetwork
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-warning/30 bg-warning/10 text-warning'
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                isOnAndeNetwork ? 'bg-success' : 'bg-warning'
              } animate-pulse`}
            />
            <span className="font-medium">{chain?.name || 'Unknown'}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Chain Menu */}
          {showChainMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowChainMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border border-border bg-bg-card shadow-lg animate-slide-up">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-text-secondary">
                    Switch Network
                  </div>
                  {supportedChains.map((supportedChain) => (
                    <button
                      key={supportedChain.id}
                      onClick={() => handleSwitchChain(supportedChain.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 ${
                        chain?.id === supportedChain.id
                          ? 'bg-primary/20 text-primary'
                          : 'text-text-primary'
                      }`}
                    >
                      <span className="font-medium">{supportedChain.name}</span>
                      {chain?.id === supportedChain.id && (
                        <Check className="h-4 w-4 text-success" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Address Display */}
        <div className="flex items-center gap-2 rounded-lg bg-bg-card px-4 py-2 text-sm border border-border">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-mono font-semibold">{formatAddress(address)}</span>
          <a
            href={`${chain?.blockExplorers?.default?.url}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Disconnect Button */}
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  // Not connected - show connect button
  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleConnect} variant="glow" size="lg" className="gap-2">
        <Wallet className="h-5 w-5" />
        Connect Wallet
      </Button>

      {/* Helper text */}
      <p className="text-xs text-text-muted">
        MetaMask, Trust, Rainbow, Coinbase & 300+ more
      </p>
    </div>
  );
}
