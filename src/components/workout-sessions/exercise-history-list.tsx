import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ExerciseHistoryEntry } from "@/lib/workout-sessions/exercise-progress";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ExerciseHistoryListProps {
  history: ExerciseHistoryEntry[];
}

/** Every completed session where this exercise appeared — clicking a row opens that session's read-only detail. */
export function ExerciseHistoryList({ history }: ExerciseHistoryListProps) {
  if (history.length === 0) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Session History</h3>
        <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">Session History</h3>
      <div className="flex flex-col gap-2">
        {history.map((entry) => (
          <Link
            key={entry.session_id}
            href={`/workouts/session/${entry.session_id}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 active:opacity-60"
          >
            <span className="text-sm font-semibold text-foreground">{formatDate(entry.completed_at)}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground">
                {entry.weight !== null ? `${entry.weight}${entry.weight_unit ?? ""}` : "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                {entry.sets_completed} × {entry.reps ?? "—"}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
