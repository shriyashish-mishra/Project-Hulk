import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTabs } from "@/components/progress/progress-tabs";
import { DateNav } from "@/components/progress/date-nav";
import { MonthlyHighlightTiles } from "@/components/progress/monthly-highlight-tiles";
import { MuscleBalanceSection } from "@/components/progress/muscle-balance-section";
import { RecoverySection } from "@/components/progress/recovery-section";
import { BodyResponseSection } from "@/components/progress/body-response-section";
import { MonthlyPhotoComparison } from "@/components/photos/monthly-photo-comparison";
import { WhatChangedSection, type ChangeRow } from "@/components/progress/what-changed-section";
import { MonthlyReflectionLists } from "@/components/progress/monthly-reflection";
import { NextMonthMilestones } from "@/components/progress/next-month-milestones";
import {
  formatMonthLabel,
  getCurrentMonthString,
  getMonthRange,
  shiftMonthString,
} from "@/lib/date";
import { getReportsInRange } from "@/lib/progress/queries";
import { getLoggedDatesInRange } from "@/lib/streaks/queries";
import {
  buildCoachReflection,
  buildTrendPoints,
  computeBestWeek,
  computeLongestStreak,
  computeMonthlyReflection,
  computePeriodSummary,
} from "@/lib/progress/stats";
import { computeRegionCounts } from "@/lib/progress/muscle-map";
import { getSleepLogsInRange } from "@/lib/sleep/queries";
import { getWaterLogsInRange } from "@/lib/water/queries";
import { getWeightLogsInRange, getLatestWeightLogBefore } from "@/lib/weight/queries";
import { getPhotosInRange } from "@/lib/photos/queries";
import { computeRecoveryInsights, computeRecoverySummary } from "@/lib/progress/recovery";
import { computeWeightTrend } from "@/lib/progress/weight-trend";
import { buildHabitsSentence, buildMonthlyHeadline } from "@/lib/progress/narrative";
import type { ChangeDirection } from "@/components/progress/what-changed-section";

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

function classifyChange(
  current: number | null,
  previous: number | null,
  threshold: number,
): ChangeDirection {
  if (current === null || previous === null) return "flat";
  const diff = current - previous;
  if (Math.abs(diff) < threshold) return "flat";
  return diff > 0 ? "up" : "down";
}

interface ProgressMonthlyPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function ProgressMonthlyPage({
  searchParams,
}: ProgressMonthlyPageProps) {
  const { month: monthParam } = await searchParams;
  const currentMonth = getCurrentMonthString();
  const month =
    monthParam && MONTH_PATTERN.test(monthParam) && monthParam <= currentMonth
      ? monthParam
      : currentMonth;

  const { start, end } = getMonthRange(month);
  const previousMonth = shiftMonthString(month, -1);
  const { start: previousStart, end: previousEnd } = getMonthRange(previousMonth);
  const daysInMonth =
    Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;

  const [
    reports,
    loggedDates,
    sleepLogs,
    previousSleepLogs,
    waterLogs,
    previousWaterLogs,
    weightLogs,
    weightBaseline,
    photos,
  ] = await Promise.all([
    getReportsInRange(previousStart, end),
    getLoggedDatesInRange(start, end),
    getSleepLogsInRange(start, end),
    getSleepLogsInRange(previousStart, previousEnd),
    getWaterLogsInRange(start, end),
    getWaterLogsInRange(previousStart, previousEnd),
    getWeightLogsInRange(start, end),
    getLatestWeightLogBefore(start),
    getPhotosInRange(start, end),
  ]);

  const allPoints = buildTrendPoints(reports);
  const currentPoints = allPoints.filter((p) => p.date >= start && p.date <= end);
  const previousPoints = allPoints.filter((p) => p.date < start);

  const current = computePeriodSummary(currentPoints);
  const previous = computePeriodSummary(previousPoints);
  const regionCounts = computeRegionCounts(currentPoints.map((p) => p.musclesTrained));
  const consistencyPct = (loggedDates.size / daysInMonth) * 100;
  const longestStreakDays = computeLongestStreak(loggedDates, start, end);
  const bestWeek = computeBestWeek(currentPoints, start, end);
  const reflection = computeMonthlyReflection(
    currentPoints,
    previousPoints,
    regionCounts,
    longestStreakDays,
    consistencyPct,
  );
  const coachReflection = buildCoachReflection(
    current,
    previous,
    longestStreakDays,
    consistencyPct,
  );

  const recoverySummary = computeRecoverySummary(sleepLogs, waterLogs);
  const previousRecoverySummary = computeRecoverySummary(previousSleepLogs, previousWaterLogs);
  const recoveryInsights = computeRecoveryInsights(
    { sleepLogs, waterLogs },
    { sleepLogs: previousSleepLogs, waterLogs: previousWaterLogs },
  );
  const weightTrend = computeWeightTrend(weightLogs, weightBaseline, "month");
  const habitsSentence = buildHabitsSentence({
    avgProteinG: current.avgProteinG,
    previousAvgProteinG: previous.avgProteinG,
    avgSleepMinutes: recoverySummary.avgSleepMinutes,
    previousAvgSleepMinutes: previousRecoverySummary.avgSleepMinutes,
  });

  const headline = buildMonthlyHeadline(
    consistencyPct,
    current.avgWorkoutScore !== null &&
      previous.avgWorkoutScore !== null &&
      current.avgWorkoutScore > previous.avgWorkoutScore,
  );

  const changeRows: ChangeRow[] = [
    {
      label: "Training consistency",
      direction: classifyChange(current.workoutsCompleted, previous.workoutsCompleted, 1),
    },
    {
      label: "Protein consistency",
      direction: classifyChange(current.avgProteinG, previous.avgProteinG, 5),
    },
    {
      label: "Sleep consistency",
      direction: classifyChange(
        recoverySummary.avgSleepMinutes,
        previousRecoverySummary.avgSleepMinutes,
        15,
      ),
    },
    { label: "Weight trend", direction: classifyChange(weightTrend.changeKg, 0, 0.3) },
  ];

  const sections = [
    {
      title: "Monthly Highlights",
      content: (
        <MonthlyHighlightTiles
          current={current}
          previous={previous}
          consistencyPct={consistencyPct}
          longestStreakDays={longestStreakDays}
          bestWeek={bestWeek}
        />
      ),
    },
    {
      title: "Muscle Balance",
      content: (
        <MuscleBalanceSection
          regionCounts={regionCounts}
          musclesTrainedByDay={currentPoints.map((p) => p.musclesTrained)}
          distributionLabel="Monthly Distribution"
        />
      ),
    },
    {
      title: "The Habits Supporting It",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground">{habitsSentence}</p>
          <RecoverySection
            avgSleepMinutes={recoverySummary.avgSleepMinutes}
            hydrationTargetHitDays={recoverySummary.hydrationTargetHitDays}
            totalDaysWithWater={recoverySummary.daysWithWater}
            insights={recoveryInsights}
          />
        </div>
      ),
    },
    {
      title: "How Your Body Responded",
      content: (
        <div className="flex flex-col gap-5">
          <BodyResponseSection
            weightTrend={weightTrend}
            photoCount={photos.length}
            periodLabel="month"
          />
          <MonthlyPhotoComparison photos={photos} />
        </div>
      ),
    },
    {
      title: "What Changed",
      content: <WhatChangedSection rows={changeRows} />,
    },
    {
      title: "Coach Reflection",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">{coachReflection}</p>
          <MonthlyReflectionLists reflection={reflection} />
        </div>
      ),
    },
    {
      title: "Next Month Milestones",
      content: <NextMonthMilestones milestones={reflection.milestones} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Progress
        </h1>
      </header>

      <ProgressTabs active="monthly" />

      <DateNav
        label={formatMonthLabel(month)}
        prevHref={`/progress/monthly?month=${previousMonth}`}
        nextHref={
          month < currentMonth
            ? `/progress/monthly?month=${shiftMonthString(month, 1)}`
            : null
        }
      />

      <p className="text-lg font-bold text-foreground">{headline}</p>

      <div className="flex flex-col gap-3">
        {sections.map(({ title, content }, index) => (
          <Card
            key={title}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
