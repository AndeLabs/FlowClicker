import { Activity, MousePointer, TrendingUp, Zap } from "lucide-react";
import { Card } from "../../ui/Card";
import { formatNumber } from "../../../lib/formatters";

interface GameStatsProps {
  totalClicks: number;
  clicksThisSession: number;
  avgClickRate: number;
  currentYear: number;
}

export function GameStats({
  totalClicks,
  clicksThisSession,
  avgClickRate,
  currentYear,
}: GameStatsProps) {
  const stats = [
    {
      icon: MousePointer,
      label: "Total Clicks",
      value: formatNumber(totalClicks),
      color: "text-primary",
    },
    {
      icon: Activity,
      label: "Session Clicks",
      value: formatNumber(clicksThisSession),
      color: "text-secondary",
    },
    {
      icon: TrendingUp,
      label: "Avg Rate",
      value: `${avgClickRate.toFixed(2)}/s`,
      color: "text-success",
    },
    {
      icon: Zap,
      label: "Game Year",
      value: `Year ${currentYear}`,
      color: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="glass">
          <div className="flex items-center gap-3">
            <div className={`rounded-full bg-bg-hover p-2 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
