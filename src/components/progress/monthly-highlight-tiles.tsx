import { formatDelta } from "./period-summary-tiles";
import type { PeriodSummary } from "@/lib/progress/types";
import type { BestWeek } from "@/lib/progress/stats";

function Tile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string | null;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-muted p-3.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-foreground">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

interface MonthlyHighlightTilesProps {
  current: PeriodSummary;
  previous: PeriodSummary;
  consistencyPct: number;
  longestStreakDays: number;
  bestWeek: BestWeek | null;
}

export function MonthlyHighlightTiles({
  current,
  previous,
  consistencyPct,
  longestStreakDays,
  bestWeek,
}: MonthlyHighlightTilesProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Tile
          label="Average score"
          value={current.avgOverallScore !== null ? `${current.avgOverallScore}` : "—"}
          hint={formatDelta(current.avgOverallScore, previous.avgOverallScore, "", "last month")}
        />
        <Tile
          label="Workouts"
          value={`${current.workoutsCompleted}`}
          hint={formatDelta(
            current.workoutsCompleted,
            previous.workoutsCompleted,
            "",
            "last month",
          )}
        />
        <Tile
          label="Avg protein"
          value={current.avgProteinG !== null ? `${current.avgProteinG}g` : "—"}
          hint={formatDelta(current.avgProteinG, previous.avgProteinG, "g", "last month")}
        />
        <Tile
          label="Avg calories"
          value={current.avgCalories !== null ? `${current.avgCalories}` : "—"}
          hint={formatDelta(current.avgCalories, previous.avgCalories, "", "last month")}
        />
        <Tile label="Consistency" value={`${Math.round(consistencyPct)}%`} />
        <Tile
          label="Longest streak"
          value={longestStreakDays > 0 ? `${longestStreakDays} days` : "—"}
        />
      </div>
      {bestWeek && (
        <div className="flex items-baseline justify-between rounded-2xl bg-muted p-3.5">
          <span className="text-xs text-muted-foreground">Best week</span>
          <span className="text-sm font-semibold text-foreground">
            {bestWeek.label}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {bestWeek.avgScore}/100 avg
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
