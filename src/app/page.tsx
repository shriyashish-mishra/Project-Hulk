import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FoodDashboard } from "@/components/food/food-dashboard";
import { WorkoutCard } from "@/components/workout/workout-card";
import { NightlyReportCard } from "@/components/nightly-report/nightly-report-card";
import { StreakPills } from "@/components/today/streak-pills";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { getStreakSummary } from "@/lib/streaks/queries";

export default async function TodayPage() {
  const loggedOn = getLocalDateString();
  const [logs, workoutLog, streaks] = await Promise.all([
    getFoodLogsForDate(loggedOn),
    getWorkoutLogForDate(loggedOn),
    getStreakSummary(loggedOn),
  ]);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            {formatDateHeading()}
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-foreground">
            Today
          </h1>
        </div>
        <Link
          href="/more"
          aria-label="More"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm font-bold text-primary transition-transform duration-150 active:scale-90"
        >
          PH
        </Link>
      </header>

      <StreakPills streaks={streaks} />

      <Card className="animate-fade-up">
        <CardContent className="divide-y divide-border">
          <FoodDashboard loggedOn={loggedOn} initialLogs={logs} />
          <WorkoutCard loggedOn={loggedOn} initialLog={workoutLog} />
        </CardContent>
      </Card>

      <NightlyReportCard />
    </div>
  );
}
