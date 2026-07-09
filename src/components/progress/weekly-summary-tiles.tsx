import type { WeeklySummary } from "@/lib/progress/types";

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

interface WeeklySummaryTilesProps {
  summary: WeeklySummary;
}

export function WeeklySummaryTiles({ summary }: WeeklySummaryTilesProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Tile
        label="Avg protein"
        value={summary.avgProteinG !== null ? `${summary.avgProteinG}g` : "—"}
      />
      <Tile
        label="Avg calories"
        value={summary.avgCalories !== null ? `${summary.avgCalories} kcal` : "—"}
      />
      <Tile
        label="Avg nutrition score"
        value={summary.avgNutritionScore !== null ? `${summary.avgNutritionScore}` : "—"}
      />
      <Tile
        label="Avg workout score"
        value={summary.avgWorkoutScore !== null ? `${summary.avgWorkoutScore}` : "—"}
      />
      <Tile label="Workouts completed" value={`${summary.workoutsCompleted}`} />
      <Tile label="Rest days" value={`${summary.restDays}`} />
    </div>
  );
}
