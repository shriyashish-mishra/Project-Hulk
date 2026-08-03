import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutsTabs } from "@/components/workouts/workouts-tabs";
import { TemplatesList } from "@/components/workout-templates/templates-list";
import { WorkoutHistoryList } from "@/components/workout/workout-history-list";
import { getRecentWorkoutLogs } from "@/lib/workout-logs/queries";
import { listTemplates } from "@/lib/workout-templates/queries";
import { requireOnboardedUser } from "@/lib/supabase/auth";

const RECENT_WORKOUT_LOG_COUNT = 10;

/**
 * The Workouts tab's Templates page. Weight progression moved to the
 * dedicated Progress tab (a per-exercise deep dive, not a compact tile
 * grid), so it's no longer duplicated here.
 */
export default async function WorkoutsPage() {
  await requireOnboardedUser();

  const [templates, recentLogs] = await Promise.all([listTemplates(), getRecentWorkoutLogs(RECENT_WORKOUT_LOG_COUNT)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Workouts</h1>
        <p className="text-sm text-muted-foreground">
          Build a template, start a session, or just log the way you always have from Today&rsquo;s Journal.
        </p>
      </div>

      <WorkoutsTabs active="templates" />

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplatesList templates={templates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutHistoryList logs={recentLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
