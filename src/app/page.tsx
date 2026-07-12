import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FoodDashboard } from "@/components/food/food-dashboard";
import { WorkoutCard } from "@/components/workout/workout-card";
import { NightlyReportCard } from "@/components/nightly-report/nightly-report-card";
import { StreakPills } from "@/components/today/streak-pills";
import { WorkoutStreakCard } from "@/components/today/workout-streak-card";
import { WaterRow } from "@/components/water/water-row";
import { SleepRow } from "@/components/sleep/sleep-row";
import { WeightRow } from "@/components/weight/weight-row";
import { PhotosRow } from "@/components/photos/photos-row";
import { CycleRow } from "@/components/cycle/cycle-row";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { getStreakSummary } from "@/lib/streaks/queries";
import { getWaterLogForDate } from "@/lib/water/queries";
import { getSleepLogForDate } from "@/lib/sleep/queries";
import { getWeightLogForDate } from "@/lib/weight/queries";
import { getUserContext } from "@/lib/profile/context";
import { requireOnboardedUser } from "@/lib/supabase/auth";

export default async function TodayPage() {
  const { user } = await requireOnboardedUser();
  const loggedOn = getLocalDateString();
  const [logs, workoutLog, streaks, waterLog, sleepLog, weightLog, userContext] = await Promise.all([
    getFoodLogsForDate(loggedOn),
    getWorkoutLogForDate(loggedOn),
    getStreakSummary(loggedOn),
    getWaterLogForDate(loggedOn),
    getSleepLogForDate(loggedOn),
    getWeightLogForDate(loggedOn),
    getUserContext(),
  ]);
  const isFemale = userContext.profile?.biological_sex === "female";

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

      <WorkoutStreakCard
        workoutStreakDays={streaks.workoutStreakDays}
        recentWorkoutDays={streaks.recentWorkoutDays}
      />

      <Card className="animate-fade-up">
        <CardContent className="divide-y divide-border">
          <FoodDashboard
            loggedOn={loggedOn}
            initialLogs={logs}
            userId={user.id}
          />
          <WorkoutCard loggedOn={loggedOn} initialLog={workoutLog} />
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Daily Signals
        </p>
        <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
          <CardContent className="divide-y divide-border">
            <WaterRow loggedOn={loggedOn} initialLog={waterLog} />
            <SleepRow loggedOn={loggedOn} initialLog={sleepLog} />
            <WeightRow loggedOn={loggedOn} initialLog={weightLog} />
            <PhotosRow loggedOn={loggedOn} />
            {isFemale && <CycleRow initialEstimate={userContext.cycleEstimate} />}
          </CardContent>
        </Card>
      </div>

      <NightlyReportCard />
    </div>
  );
}
