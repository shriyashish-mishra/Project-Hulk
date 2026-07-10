import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTabs } from "@/components/progress/progress-tabs";
import { DateNav } from "@/components/progress/date-nav";
import { DailyScoreCard } from "@/components/progress/daily-score-card";
import { NutrientBar } from "@/components/progress/nutrient-bar";
import { DailyWorkoutSummary } from "@/components/progress/daily-workout-summary";
import { CoachFeedbackList } from "@/components/progress/coach-feedback-list";
import { NextDayPlanCard } from "@/components/progress/next-day-plan-card";
import { addDays, formatShortDate, getLocalDateString } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { getReportsInRange } from "@/lib/progress/queries";
import { buildTrendPoints, computePeriodSummary } from "@/lib/progress/stats";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ProgressDailyPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function ProgressDailyPage({
  searchParams,
}: ProgressDailyPageProps) {
  const { date: dateParam } = await searchParams;
  const today = getLocalDateString();
  const date =
    dateParam && DATE_PATTERN.test(dateParam) && dateParam <= today
      ? dateParam
      : today;
  const isToday = date === today;

  const [report, workoutLog, trailingReports] = await Promise.all([
    getAiReportForDate(date),
    getWorkoutLogForDate(date),
    getReportsInRange(addDays(date, -7), addDays(date, -1)),
  ]);

  const trailingSummary = computePeriodSummary(buildTrendPoints(trailingReports));

  const label = `${isToday ? "Today, " : ""}${formatShortDate(
    new Date(`${date}T00:00:00`),
  )}`;

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

          <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
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
                <span className="text-xs text-muted-foreground">
                  {report.parsed_json.calorie_balance}
                </span>
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
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "180ms" }}>
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

          <Card className="animate-fade-up" style={{ animationDelay: "240ms" }}>
            <CardHeader>
              <CardTitle>Next Day Workout Plan</CardTitle>
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
