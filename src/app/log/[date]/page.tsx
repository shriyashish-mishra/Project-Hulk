import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent } from "@/components/ui/card";
import { FoodDashboard } from "@/components/food/food-dashboard";
import { WorkoutCard } from "@/components/workout/workout-card";
import { WaterRow } from "@/components/water/water-row";
import { SleepRow } from "@/components/sleep/sleep-row";
import { WeightRow } from "@/components/weight/weight-row";
import { PhotosRow } from "@/components/photos/photos-row";
import { CycleRow } from "@/components/cycle/cycle-row";
import { NightlyReportCard } from "@/components/nightly-report/nightly-report-card";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getFoodPresets } from "@/lib/food-presets/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { getWorkoutPresets } from "@/lib/workout-presets/queries";
import { getWaterLogForDate } from "@/lib/water/queries";
import { getSleepLogForDate } from "@/lib/sleep/queries";
import { getWeightLogForDate } from "@/lib/weight/queries";
import { getUserContext } from "@/lib/profile/context";
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

  const [
    logs,
    foodPresets,
    workoutLog,
    workoutPresets,
    waterLog,
    sleepLog,
    weightLog,
    userContext,
  ] = await Promise.all([
    getFoodLogsForDate(date),
    getFoodPresets(),
    getWorkoutLogForDate(date),
    getWorkoutPresets(),
    getWaterLogForDate(date),
    getSleepLogForDate(date),
    getWeightLogForDate(date),
    getUserContext(date),
  ]);
  const isFemale = userContext.profile?.biological_sex === "female";

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
          <FoodDashboard
            loggedOn={date}
            initialLogs={logs}
            initialPresets={foodPresets}
            userId={user.id}
          />
          <WorkoutCard
            loggedOn={date}
            initialLog={workoutLog}
            initialPresets={workoutPresets}
          />
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Daily Signals
        </p>
        <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
          <CardContent className="divide-y divide-border">
            <WaterRow loggedOn={date} initialLog={waterLog} />
            <SleepRow loggedOn={date} initialLog={sleepLog} />
            <WeightRow loggedOn={date} initialLog={weightLog} />
            <PhotosRow loggedOn={date} />
            {isFemale && (
              <CycleRow
                initialPeriods={userContext.periods}
                fallbackCycleLengthDays={userContext.profile?.average_cycle_length_days ?? null}
                asOfDate={date}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <NightlyReportCard loggedOn={date} />
    </div>
  );
}
