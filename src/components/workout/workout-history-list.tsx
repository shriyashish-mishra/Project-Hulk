import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatShortDateWithWeekday } from "@/lib/date";
import type { WorkoutLog } from "@/lib/workout-logs/types";
import { parsePresetExercises } from "@/lib/workout-presets/format";

const MAX_PREVIEW_LINES = 3;

interface WorkoutHistoryListProps {
  logs: WorkoutLog[];
}

/** Recent logged workouts, each broken into exercise/detail lines the same way a generated report or saved preset is — click through to that day's full journal entry to edit it. */
export function WorkoutHistoryList({ logs }: WorkoutHistoryListProps) {
  if (logs.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        No workouts logged yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log) => {
        const lines = parsePresetExercises(log.raw_text);
        const visible = lines.slice(0, MAX_PREVIEW_LINES);
        const remaining = lines.length - visible.length;

        return (
          <Link
            key={log.id}
            href={`/log/${log.logged_on}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 active:opacity-60"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {formatShortDateWithWeekday(new Date(`${log.logged_on}T00:00:00`))}
              </p>
              <div className="mt-1 flex flex-col gap-0.5">
                {visible.map((line, index) => (
                  <div key={index} className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="truncate text-muted-foreground">{line.name}</span>
                    {line.detail && <span className="shrink-0 text-xs text-muted-foreground/70">{line.detail}</span>}
                  </div>
                ))}
                {remaining > 0 && <span className="text-xs text-muted-foreground/70">+{remaining} more</span>}
              </div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}
