import type { PeriodSummary } from "@/lib/progress/types";

export function formatDelta(
  current: number | null,
  previous: number | null,
  unit: string,
  periodLabel: string,
): string | null {
  if (current === null || previous === null) return null;
  const diff = Math.round((current - previous) * 10) / 10;
  if (diff === 0) return `Flat vs ${periodLabel}`;
  return `${diff > 0 ? "+" : ""}${diff}${unit} vs ${periodLabel}`;
}

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

interface PeriodSummaryTilesProps {
  current: PeriodSummary;
  previous: PeriodSummary;
  periodLabel: string;
}

export function PeriodSummaryTiles({
  current,
  previous,
  periodLabel,
}: PeriodSummaryTilesProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Tile
          label="Avg calories"
          value={current.avgCalories !== null ? `${current.avgCalories} kcal` : "—"}
          hint={formatDelta(current.avgCalories, previous.avgCalories, "", periodLabel)}
        />
        <Tile
          label="Avg protein"
          value={current.avgProteinG !== null ? `${current.avgProteinG}g` : "—"}
          hint={formatDelta(current.avgProteinG, previous.avgProteinG, "g", periodLabel)}
        />
        <Tile label="Workout days" value={`${current.workoutsCompleted}`} />
        <Tile label="Rest days" value={`${current.restDays}`} />
      </div>
      <div className="flex flex-col gap-1 rounded-2xl bg-muted p-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Average score</span>
          <span className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {current.avgOverallScore ?? "—"}
            </span>
            {formatDelta(current.avgOverallScore, previous.avgOverallScore, "", periodLabel) && (
              <span className="text-xs text-muted-foreground">
                {formatDelta(current.avgOverallScore, previous.avgOverallScore, "", periodLabel)}
              </span>
            )}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Nutrition + workout + recovery, blended into one 0-100 number
        </span>
      </div>
    </div>
  );
}
