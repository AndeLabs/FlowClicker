import { useState } from "react";
import { ClickButton } from "./components/game/ClickButton";
import { TokenCounter } from "./components/game/TokenCounter";
import { TrustScore } from "./components/game/TrustScore";
import { GameStats } from "./components/game/GameStats";
import { ConnectWallet } from "./components/web3/ConnectWallet";
import { RegisterSW } from "./components/pwa/RegisterSW";
import { useGameState } from "./hooks/game/useGameState";
import { usePlayerData } from "./hooks/web3/usePlayerData";
import { useGlobalState } from "./hooks/web3/useGlobalState";
import { calculateTokensPerClick, getCurrentGameYear } from "./lib/utils";
import "./styles/globals.css";

function App() {
  const [walletAddress, setWalletAddress] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessingClick, setIsProcessingClick] = useState(false);

  const { stats, incrementClick, addTokens } = useGameState();
  const { playerData, isLoading: isLoadingPlayer } = usePlayerData(walletAddress);
  const { globalState, isLoading: isLoadingGlobal } = useGlobalState();

  // Calculate current reward rate
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const startTimestamp = globalState?.startTimestamp || currentTimestamp;
  const tokensPerClick = calculateTokensPerClick(startTimestamp, currentTimestamp);
  const currentYear = getCurrentGameYear(startTimestamp, currentTimestamp);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // TODO: Implement actual wallet connection
      // For now, just mock it
      setTimeout(() => {
        setWalletAddress("0x1234567890123456789012345678901234567890");
        setIsConnecting(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(undefined);
  };

  const handleClick = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsProcessingClick(true);

    try {
      // TODO: Call actual MUD system call
      // For now, just update local state
      incrementClick();
      addTokens(tokensPerClick);

      // Simulate transaction delay
      setTimeout(() => {
        setIsProcessingClick(false);
      }, 200);
    } catch (error) {
      console.error("Click failed:", error);
      setIsProcessingClick(false);
    }
  };

  const totalTokens = playerData
    ? Number(playerData.totalRewards) / 1e18 + stats.tokensEarnedThisSession
    : stats.tokensEarnedThisSession;

  const totalClicks = playerData
    ? Number(playerData.totalClicks) + stats.clicksThisSession
    : stats.clicksThisSession;

  return (
    <div className="min-h-screen bg-bg-game">
      {/* Header */}
      <header className="border-b border-border bg-bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">FlowClicker</h1>
              <p className="text-xs text-text-secondary">
                Full Onchain Clicker Game
              </p>
            </div>
          </div>

          <ConnectWallet
            address={walletAddress}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnecting={isConnecting}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column - Game Area */}
          <div className="space-y-8">
            {/* Stats */}
            <GameStats
              totalClicks={totalClicks}
              clicksThisSession={stats.clicksThisSession}
              avgClickRate={stats.avgClickRate}
              currentYear={currentYear}
            />

            {/* Click Button */}
            <div className="flex justify-center py-12">
              <ClickButton
                onClick={handleClick}
                disabled={!walletAddress}
                tokensPerClick={tokensPerClick}
                isProcessing={isProcessingClick}
              />
            </div>

            {/* Instructions */}
            {!walletAddress && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold">
                  Welcome to FlowClicker! 🎮
                </h3>
                <p className="text-text-secondary">
                  Connect your wallet to start earning $FLOW tokens with each
                  click.
                  <br />
                  The earlier you play, the more you earn! (Temporal decay over
                  3 years)
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Token Counter */}
            <TokenCounter
              totalTokens={totalTokens}
              sessionTokens={stats.tokensEarnedThisSession}
              rewardRate={tokensPerClick}
            />

            {/* Trust Score */}
            {playerData && (
              <TrustScore
                score={playerData.trustScore}
                isBotFlagged={playerData.isBotFlagged}
              />
            )}

            {/* Game Info */}
            <div className="rounded-xl border border-border bg-bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">How It Works</h3>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>
                    Each click mints $FLOW tokens instantly to your wallet
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>
                    Rewards decrease over 3 years (temporal decay)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Trust score system prevents bot abuse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Compete in global country leaderboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>
                    Current rate:{" "}
                    <strong>{tokensPerClick.toFixed(4)} FLOW/click</strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Network Info */}
            <div className="rounded-xl border border-border bg-bg-card p-4 text-xs text-text-muted">
              <div className="flex items-center justify-between">
                <span>Network:</span>
                <span className="font-semibold text-text-primary">
                  ANDE Network
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Chain ID:</span>
                <span className="font-semibold text-text-primary">6174</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-card/30 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-text-muted">
          <p>Built with ❤️ using MUD Framework on ANDE Network</p>
          <p className="mt-2">
            Full onchain • Instant minting • Fair gameplay
          </p>
        </div>
      </footer>

      {/* PWA Update Toast */}
      <RegisterSW />
    </div>
  );
}

export default App;
