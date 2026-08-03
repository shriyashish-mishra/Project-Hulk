import type { ExerciseHistoryEntry, ExerciseTrend, PersonalRecords } from "@/lib/workout-sessions/exercise-progress";

function StatTile({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card p-3.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-foreground">
        {value}
        {unit && <span className="text-xs font-normal text-muted-foreground"> {unit}</span>}
      </span>
    </div>
  );
}

function trendLabel(trend: ExerciseTrend | null): string {
  if (!trend) return "Not enough data";
  if (trend.direction === "up") return "Improving ↑";
  if (trend.direction === "down") return "Declining ↓";
  return "Steady →";
}

interface ExerciseOverviewProps {
  history: ExerciseHistoryEntry[];
  personalRecords: PersonalRecords;
  trend: ExerciseTrend | null;
}

/** Current weight, best weight ever, last session's line, and a trend read — the "at a glance" row at the top of an exercise's progression. */
export function ExerciseOverview({ history, personalRecords, trend }: ExerciseOverviewProps) {
  const latest = history[0] ?? null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile label="Current Weight" value={latest?.weight ?? "—"} unit={latest?.weight_unit ?? undefined} />
      <StatTile
        label="Best Weight"
        value={personalRecords.max_weight?.value ?? "—"}
        unit={personalRecords.max_weight?.unit}
      />
      <StatTile
        label="Last Session"
        value={latest ? `${latest.weight ?? "—"}${latest.weight_unit ?? ""} × ${latest.reps ?? "—"}` : "—"}
        unit={latest ? `× ${latest.sets_completed} sets` : undefined}
      />
      <StatTile label="Trend" value={trendLabel(trend)} />
    </div>
  );
}
