import { BackLink } from "@/components/ui/back-link";
import { WorkoutsTabs } from "@/components/workouts/workouts-tabs";
import { WorkoutHistoryList } from "@/components/workout-sessions/workout-history-list";
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

      <WorkoutHistoryList sessions={sessions} />
    </div>
  );
}
