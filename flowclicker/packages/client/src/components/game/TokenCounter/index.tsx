import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { formatTokens, formatCompact } from "../../../lib/formatters";
import { Card } from "../../ui/Card";

interface TokenCounterProps {
  totalTokens: number;
  sessionTokens: number;
  rewardRate: number;
}

export function TokenCounter({
  totalTokens,
  sessionTokens,
  rewardRate,
}: TokenCounterProps) {
  return (
    <Card className="glass">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <Coins className="h-8 w-8 text-primary" />
        </div>

        <div className="flex-1">
          <p className="text-sm text-text-secondary">Total Earned</p>
          <motion.p
            className="text-3xl font-bold text-gradient"
            key={totalTokens}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatCompact(totalTokens)} FLOW
          </motion.p>

          <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
            <span>Session: {sessionTokens.toFixed(4)}</span>
            <span>•</span>
            <span>Rate: {rewardRate.toFixed(4)}/click</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
