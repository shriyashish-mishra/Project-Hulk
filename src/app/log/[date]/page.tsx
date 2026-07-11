import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent } from "@/components/ui/card";
import { FoodDashboard } from "@/components/food/food-dashboard";
import { WorkoutCard } from "@/components/workout/workout-card";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { requireOnboardedUser } from "@/lib/supabase/auth";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface LogDatePageProps {
  params: Promise<{ date: string }>;
}

export default async function LogDatePage({ params }: LogDatePageProps) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) notFound();

  const { user } = await requireOnboardedUser();
  const today = getLocalDateString();
  const isToday = date === today;

  const [logs, workoutLog] = await Promise.all([
    getFoodLogsForDate(date),
    getWorkoutLogForDate(date),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/more" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          {formatDateHeading(new Date(`${date}T00:00:00`))}
        </h1>
        {!isToday && (
          <p className="text-sm text-muted-foreground">Backfilling a past day</p>
        )}
      </div>

      <Card>
        <CardContent className="divide-y divide-border">
          <FoodDashboard loggedOn={date} initialLogs={logs} userId={user.id} />
          <WorkoutCard loggedOn={date} initialLog={workoutLog} />
        </CardContent>
      </Card>
    </div>
  );
}
