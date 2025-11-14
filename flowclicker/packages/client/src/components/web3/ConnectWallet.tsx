import { Wallet } from "lucide-react";
import { Button } from "../ui/Button";
import { formatAddress } from "../../lib/formatters";

interface ConnectWalletProps {
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting?: boolean;
}

export function ConnectWallet({
  address,
  onConnect,
  onDisconnect,
  isConnecting = false,
}: ConnectWalletProps) {
  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-bg-card px-4 py-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-text-secondary">Connected:</span>
          <span className="font-mono font-semibold">{formatAddress(address)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onConnect}
      disabled={isConnecting}
      variant="glow"
      size="lg"
      className="gap-2"
    >
      <Wallet className="h-5 w-5" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
