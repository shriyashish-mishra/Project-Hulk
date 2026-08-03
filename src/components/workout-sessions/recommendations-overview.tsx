import Link from "next/link";
import type { ExerciseRecommendationSummary } from "@/lib/workout-sessions/exercise-progress";

interface RecommendationsOverviewProps {
  summaries: ExerciseRecommendationSummary[];
  selectedExerciseName: string;
}

function ExerciseLink({
  summary,
  selected,
  valueLabel,
}: {
  summary: ExerciseRecommendationSummary;
  selected: boolean;
  valueLabel: string;
}) {
  return (
    <li>
      <Link
        href={`/workouts/progress?exercise=${encodeURIComponent(summary.exercise.name)}`}
        className={`flex items-center justify-between gap-3 rounded-xl px-2.5 py-1.5 text-sm transition-colors ${
          selected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
        }`}
      >
        <span className="truncate">{summary.exercise.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{valueLabel}</span>
      </Link>
    </li>
  );
}

/**
 * Every recently-trained exercise's recommendation grouped by action —
 * "Ready to Increase" and "Hold Steady" as two separate lists, so which
 * exercises need attention is visible without clicking through each one
 * via the picker below.
 */
export function RecommendationsOverview({ summaries, selectedExerciseName }: RecommendationsOverviewProps) {
  const increasing = summaries.filter((s) => s.recommendation.action === "increase");
  const holding = summaries.filter((s) => s.recommendation.action === "hold" && s.recommendation.confidence !== "low");

  if (increasing.length === 0 && holding.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {increasing.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold text-primary">Ready to Increase</h3>
          <ul className="flex flex-col gap-0.5">
            {increasing.map((summary) => (
              <ExerciseLink
                key={summary.exercise.name}
                summary={summary}
                selected={summary.exercise.name.toLowerCase() === selectedExerciseName.toLowerCase()}
                valueLabel={`→ ${summary.recommendation.next_weight}${summary.exercise.default_unit}`}
              />
            ))}
          </ul>
        </div>
      )}
      {holding.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Hold Steady</h3>
          <ul className="flex flex-col gap-0.5">
            {holding.map((summary) => (
              <ExerciseLink
                key={summary.exercise.name}
                summary={summary}
                selected={summary.exercise.name.toLowerCase() === selectedExerciseName.toLowerCase()}
                valueLabel={`${summary.recommendation.next_weight}${summary.exercise.default_unit}`}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
