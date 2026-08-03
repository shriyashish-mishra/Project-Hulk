import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ExerciseHistoryEntry } from "@/lib/workout-sessions/exercise-progress";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ExerciseHistoryListProps {
  history: ExerciseHistoryEntry[];
}

/** Every completed session or past report where this exercise appeared — clicking a row opens that session's read-only detail, or the day's report for a report-derived entry. */
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
            key={`${entry.source}-${entry.session_id ?? entry.report_date}`}
            href={entry.source === "session" ? `/workouts/session/${entry.session_id}` : `/report/${entry.report_date}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 active:opacity-60"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{formatDate(entry.completed_at)}</span>
              {entry.source === "report" && (
                <Badge variant="outline" className="h-5 px-2 text-[10px]">
                  From report
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {entry.weight !== null ? (
                <>
                  <span className="text-sm text-foreground">{`${entry.weight}${entry.weight_unit ?? ""}`}</span>
                  <span className="text-xs text-muted-foreground">
                    {entry.sets_completed} × {entry.reps ?? "—"}
                  </span>
                </>
              ) : (
                <span className="max-w-40 truncate text-xs text-muted-foreground">{entry.raw_detail ?? "—"}</span>
              )}
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
