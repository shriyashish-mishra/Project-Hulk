import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTabs } from "@/components/progress/progress-tabs";
import { DateNav } from "@/components/progress/date-nav";
import { PeriodSummaryTiles } from "@/components/progress/period-summary-tiles";
import { ScoreTrendChart } from "@/components/progress/score-trend-chart";
import { NutritionTrendChart } from "@/components/progress/nutrition-trend-chart";
import { CalorieBalanceChart } from "@/components/progress/calorie-balance-chart";
import { ConsistencyTimeline } from "@/components/progress/consistency-timeline";
import { MuscleBalanceSection } from "@/components/progress/muscle-balance-section";
import { CoachMemoryCard } from "@/components/progress/coach-memory-card";
import { RoadmapCard } from "@/components/progress/roadmap-card";
import {
  addDays,
  formatWeekRangeLabel,
  getLocalDateString,
  getWeekStart,
} from "@/lib/date";
import { getReportsInRange } from "@/lib/progress/queries";
import {
  buildTrendPoints,
  computeCoachInsights,
  computePeriodSummary,
} from "@/lib/progress/stats";
import { computeRegionCounts } from "@/lib/progress/muscle-map";
import { generateWeeklyRoadmap } from "@/lib/progress/weekly-plan";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ProgressWeeklyPageProps {
  searchParams: Promise<{ start?: string }>;
}

export default async function ProgressWeeklyPage({
  searchParams,
}: ProgressWeeklyPageProps) {
  const { start: startParam } = await searchParams;
  const today = getLocalDateString();
  const currentWeekStart = getWeekStart(today);
  const start =
    startParam &&
    DATE_PATTERN.test(startParam) &&
    startParam === getWeekStart(startParam) &&
    startParam <= currentWeekStart
      ? startParam
      : currentWeekStart;
  const end = addDays(start, 6);
  const previousStart = addDays(start, -7);

  const reports = await getReportsInRange(previousStart, end);
  const allPoints = buildTrendPoints(reports);
  const thisWeekPoints = allPoints.filter((p) => p.date >= start);
  const lastWeekPoints = allPoints.filter((p) => p.date < start);
  const pointsByDate = new Map(allPoints.map((p) => [p.date, p]));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const current = computePeriodSummary(thisWeekPoints);
  const previous = computePeriodSummary(lastWeekPoints);
  const regionCounts = computeRegionCounts(thisWeekPoints.map((p) => p.musclesTrained));
  const coachInsights = computeCoachInsights(thisWeekPoints, lastWeekPoints);
  const roadmap = generateWeeklyRoadmap(regionCounts, current.avgProteinG);

  const sections = [
    {
      title: "Week at a Glance",
      content: (
        <PeriodSummaryTiles current={current} previous={previous} periodLabel="last week" />
      ),
    },
    {
      title: "Score Trend",
      content: <ScoreTrendChart days={days} pointsByDate={pointsByDate} />,
    },
    {
      title: "Nutrition Trend",
      content: <NutritionTrendChart days={days} pointsByDate={pointsByDate} />,
    },
    {
      title: "Calorie Balance",
      content: <CalorieBalanceChart days={days} pointsByDate={pointsByDate} />,
    },
    {
      title: "Consistency",
      content: <ConsistencyTimeline days={days} pointsByDate={pointsByDate} />,
    },
    {
      title: "Muscle Balance",
      content: (
        <MuscleBalanceSection
          regionCounts={regionCounts}
          distributionLabel="Weekly Distribution"
        />
      ),
    },
    {
      title: "Coach Memory",
      content: <CoachMemoryCard insights={coachInsights} />,
    },
    {
      title: "Next Week Workout Plan",
      content: <RoadmapCard roadmap={roadmap} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Progress
        </h1>
      </header>

      <ProgressTabs active="weekly" />

      <DateNav
        label={formatWeekRangeLabel(start, end)}
        prevHref={`/progress/weekly?start=${previousStart}`}
        nextHref={
          start < currentWeekStart
            ? `/progress/weekly?start=${addDays(start, 7)}`
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
