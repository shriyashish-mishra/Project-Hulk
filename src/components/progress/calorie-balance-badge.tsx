import { cn } from "@/lib/utils";

interface CalorieBalanceBadgeProps {
  balanceKcal: number | null;
  balanceText: string;
}

export function CalorieBalanceBadge({ balanceKcal, balanceText }: CalorieBalanceBadgeProps) {
  if (balanceKcal === null) {
    return <span className="text-xs text-muted-foreground">{balanceText}</span>;
  }

  const isDeficit = balanceKcal <= 0;

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
          isDeficit ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
        )}
      >
        {balanceKcal > 0 ? "+" : ""}
        {balanceKcal} kcal
      </span>
      <span className="text-xs text-muted-foreground">
        {isDeficit ? "Deficit" : "Surplus"} vs. maintenance
      </span>
    </div>
  );
}
