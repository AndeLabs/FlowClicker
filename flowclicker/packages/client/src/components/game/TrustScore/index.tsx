import { Shield, AlertTriangle } from "lucide-react";
import { getTrustScoreColor, getTrustScoreMessage } from "../../../lib/utils";
import { Card } from "../../ui/Card";
import { Progress } from "../../ui/Progress";
import { Badge } from "../../ui/Badge";
import { GAME_CONFIG } from "../../../lib/constants";

interface TrustScoreProps {
  score: number;
  isBotFlagged: boolean;
}

export function TrustScore({ score, isBotFlagged }: TrustScoreProps) {
  const color = getTrustScoreColor(score);
  const message = getTrustScoreMessage(score);
  const percentage = (score / GAME_CONFIG.MAX_TRUST_SCORE) * 100;

  const variant =
    score >= 900
      ? "success"
      : score >= 700
      ? "default"
      : score >= 500
      ? "secondary"
      : score >= 300
      ? "warning"
      : "danger";

  return (
    <Card className={isBotFlagged ? "border-danger" : ""}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isBotFlagged ? (
              <AlertTriangle className="h-5 w-5 text-danger" />
            ) : (
              <Shield className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-semibold">Trust Score</h3>
          </div>

          <Badge variant={isBotFlagged ? "destructive" : variant}>
            {message}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Score</span>
            <span className="font-bold" style={{ color }}>
              {score} / {GAME_CONFIG.MAX_TRUST_SCORE}
            </span>
          </div>

          <Progress
            value={percentage}
            variant={
              isBotFlagged
                ? "danger"
                : score >= 700
                ? "success"
                : score >= 500
                ? "default"
                : score >= 300
                ? "warning"
                : "danger"
            }
          />
        </div>

        {isBotFlagged && (
          <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
            ⚠️ Bot behavior detected. Play fair to restore trust!
          </div>
        )}

        {score < GAME_CONFIG.BOT_THRESHOLD && !isBotFlagged && (
          <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
            ⚡ Your trust score is low. Slow down to avoid being flagged!
          </div>
        )}
      </div>
    </Card>
  );
}
