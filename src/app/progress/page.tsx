import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTabs } from "@/components/progress/progress-tabs";
import { DateNav } from "@/components/progress/date-nav";
import { DailyScoreCard } from "@/components/progress/daily-score-card";
import { TodayAtGlance } from "@/components/progress/today-at-a-glance";
import { NutrientBar } from "@/components/progress/nutrient-bar";
import { DailyWorkoutSummary } from "@/components/progress/daily-workout-summary";
import { CoachFeedbackList } from "@/components/progress/coach-feedback-list";
import { NextDayPlanCard } from "@/components/progress/next-day-plan-card";
import { CalorieBalanceBadge } from "@/components/progress/calorie-balance-badge";
import { addDays, formatDuration, formatShortDate, getLocalDateString } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { getReportsInRange } from "@/lib/progress/queries";
import {
  buildTrendPoints,
  computePeriodSummary,
  parseCalorieBalanceFallback,
} from "@/lib/progress/stats";
import { getWaterLogForDate } from "@/lib/water/queries";
import { getSleepLogForDate, getSleepLogsInRange } from "@/lib/sleep/queries";
import { getWeightLogForDate } from "@/lib/weight/queries";
import { getPhotosForDate } from "@/lib/photos/queries";
import { buildDailyRecoverySentence, computeRecoverySummary } from "@/lib/progress/recovery";
import { getUserContext } from "@/lib/profile/context";
import { deriveMuscleMapModel } from "@/lib/profile/types";
import { requireOnboardedUser } from "@/lib/supabase/auth";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ProgressDailyPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function ProgressDailyPage({
  searchParams,
}: ProgressDailyPageProps) {
  await requireOnboardedUser();
  const { date: dateParam } = await searchParams;
  const today = getLocalDateString();
  const date =
    dateParam && DATE_PATTERN.test(dateParam) && dateParam <= today
      ? dateParam
      : today;
  const isToday = date === today;

  const [report, workoutLog, trailingReports, waterLog, sleepLog, trailingSleepLogs, weightLog, photos, userContext] =
    await Promise.all([
      getAiReportForDate(date),
      getWorkoutLogForDate(date),
      getReportsInRange(addDays(date, -7), addDays(date, -1)),
      getWaterLogForDate(date),
      getSleepLogForDate(date),
      getSleepLogsInRange(addDays(date, -7), addDays(date, -1)),
      getWeightLogForDate(date),
      getPhotosForDate(date),
      getUserContext(),
    ]);

  const trailingSummary = computePeriodSummary(buildTrendPoints(trailingReports));
  const { avgSleepMinutes } = computeRecoverySummary(trailingSleepLogs, []);

  const label = `${isToday ? "Today, " : ""}${formatShortDate(
    new Date(`${date}T00:00:00`),
  )}`;

  const glanceRows = report
    ? [
        { label: "Protein", value: `${report.parsed_json.protein_g}g` },
        { label: "Calories", value: `~${report.parsed_json.estimated_calories}` },
        {
          label: "Water",
          value: waterLog ? `${waterLog.glass_count} glasses` : "Not logged",
        },
        {
          label: "Sleep",
          value: sleepLog ? formatDuration(sleepLog.duration_minutes) : "Not logged",
        },
        {
          label: "Workout",
          value: report.parsed_json.muscles_trained.length > 0 ? "Completed" : "Rest day",
        },
        ...(weightLog ? [{ label: "Weight", value: `${Number(weightLog.weight_kg)} kg` }] : []),
      ]
    : [];

  const recoverySentence = buildDailyRecoverySentence({
    sleepMinutes: sleepLog?.duration_minutes ?? null,
    avgSleepMinutes,
    waterGlasses: waterLog?.glass_count ?? null,
    waterTarget: waterLog?.target_glasses ?? userContext.hydrationTargetGlasses ?? 8,
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Progress
        </h1>
      </header>

      <ProgressTabs active="daily" />

      <DateNav
        label={label}
        prevHref={`/progress?date=${addDays(date, -1)}`}
        nextHref={isToday ? null : `/progress?date=${addDays(date, 1)}`}
      />

      {report ? (
        <>
          <DailyScoreCard report={report.parsed_json} />

          <Card className="animate-fade-up" style={{ animationDelay: "40ms" }}>
            <CardHeader>
              <CardTitle>Today at a Glance</CardTitle>
            </CardHeader>
            <CardContent>
              <TodayAtGlance rows={glanceRows} />
            </CardContent>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "80ms" }}>
            <CardHeader>
              <CardTitle>Today&rsquo;s Nutrition</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <NutrientBar
                  label="Calories"
                  value={report.parsed_json.estimated_calories}
                  unit=" kcal"
                  avg={trailingSummary.avgCalories}
                />
                <CalorieBalanceBadge
                  balanceKcal={
                    report.parsed_json.calorie_balance_kcal ??
                    parseCalorieBalanceFallback(report.parsed_json.calorie_balance)
                  }
                  balanceText={report.parsed_json.calorie_balance}
                />
              </div>
              <NutrientBar
                label="Protein"
                value={report.parsed_json.protein_g}
                unit="g"
                avg={trailingSummary.avgProteinG}
              />
              <NutrientBar
                label="Carbs"
                value={report.parsed_json.carbs_g}
                unit="g"
                avg={null}
              />
              <NutrientBar
                label="Fat"
                value={report.parsed_json.fat_g}
                unit="g"
                avg={null}
              />
              <NutrientBar
                label="Fibre"
                value={report.parsed_json.fiber_g}
                unit="g"
                avg={null}
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <CardHeader>
              <CardTitle>Today&rsquo;s Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <DailyWorkoutSummary
                musclesTrained={report.parsed_json.muscles_trained}
                workoutNote={workoutLog?.raw_text ?? null}
                durationMin={report.parsed_json.workout_duration_min}
                caloriesBurned={report.parsed_json.workout_calories_burned}
                exercises={report.parsed_json.workout_exercises}
                muscleMapModel={deriveMuscleMapModel(userContext.profile?.biological_sex ?? null)}
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "160ms" }}>
            <CardHeader>
              <CardTitle>Coach Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CoachFeedbackList
                strengths={report.parsed_json.strengths}
                improvements={report.parsed_json.improvements}
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle>Recovery</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm text-foreground">{recoverySentence}</p>
              {photos.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {photos.length} progress photo{photos.length > 1 ? "s" : ""} captured today.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
            <CardHeader>
              <CardTitle>Coach&rsquo;s Take</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{report.parsed_json.coach_summary}</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "280ms" }}>
            <CardHeader>
              <CardTitle>Tomorrow</CardTitle>
            </CardHeader>
            <CardContent>
              <NextDayPlanCard
                tomorrowWorkout={report.parsed_json.tomorrow_workout}
                exercises={report.parsed_json.tomorrow_workout_exercises}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="animate-fade-up">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No report for this day yet.
            </p>
            <Button
              nativeButton={false}
              render={<Link href={isToday ? "/report/generate" : "/report/import"} />}
            >
              {isToday ? "Generate Nightly Report" : "Import a Report"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
