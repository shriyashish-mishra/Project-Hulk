import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { WorkoutsTabs } from "@/components/workouts/workouts-tabs";
import { formatShortDateWithWeekday } from "@/lib/date";
import { listCompletedSessions } from "@/lib/workout-sessions/queries";
import { requireOnboardedUser } from "@/lib/supabase/auth";

/** Full history of completed workout sessions — every "Start Workout" that was seen through to "Complete Workout," newest first. */
export default async function WorkoutHistoryPage() {
  await requireOnboardedUser();
  const sessions = await listCompletedSessions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/workouts" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Workouts</h1>
      </div>

      <WorkoutsTabs active="history" />

      {sessions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No completed workouts yet — finish a session to see it here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/workouts/session/${session.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 active:opacity-60"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{session.template_name_snapshot}</p>
                <p className="text-xs text-muted-foreground">
                  {formatShortDateWithWeekday(new Date(session.completed_at ?? session.started_at))}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {session.total_calories !== null && (
                  <span className="text-xs text-muted-foreground">{session.total_calories} kcal</span>
                )}
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
