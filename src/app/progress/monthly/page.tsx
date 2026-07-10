import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTabs } from "@/components/progress/progress-tabs";
import { DateNav } from "@/components/progress/date-nav";
import { MonthlyHighlightTiles } from "@/components/progress/monthly-highlight-tiles";
import { MuscleBalanceSection } from "@/components/progress/muscle-balance-section";
import { MonthlyReflectionLists } from "@/components/progress/monthly-reflection";
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

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

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
  const { start: previousStart } = getMonthRange(previousMonth);
  const daysInMonth =
    Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;

  const [reports, loggedDates] = await Promise.all([
    getReportsInRange(previousStart, end),
    getLoggedDatesInRange(start, end),
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
          distributionLabel="Monthly Distribution"
        />
      ),
    },
    {
      title: "Coach Reflection",
      content: <p className="text-sm text-muted-foreground">{coachReflection}</p>,
    },
    {
      title: "Looking Ahead",
      content: <MonthlyReflectionLists reflection={reflection} />,
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
