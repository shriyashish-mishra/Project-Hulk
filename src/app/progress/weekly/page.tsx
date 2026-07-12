import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTabs } from "@/components/progress/progress-tabs";
import { DateNav } from "@/components/progress/date-nav";
import { PeriodSummaryTiles } from "@/components/progress/period-summary-tiles";
import { ScoreTrendChart } from "@/components/progress/score-trend-chart";
import { NutritionTrendChart } from "@/components/progress/nutrition-trend-chart";
import { ConsistencyTimeline } from "@/components/progress/consistency-timeline";
import { MuscleBalanceSection } from "@/components/progress/muscle-balance-section";
import { RecoverySection } from "@/components/progress/recovery-section";
import { BodyResponseSection } from "@/components/progress/body-response-section";
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
import { getSleepLogsInRange } from "@/lib/sleep/queries";
import { getWaterLogsInRange } from "@/lib/water/queries";
import { getWeightLogsInRange, getLatestWeightLogBefore } from "@/lib/weight/queries";
import { getPhotosInRange } from "@/lib/photos/queries";
import { computeRecoveryInsights, computeRecoverySummary } from "@/lib/progress/recovery";
import { computeWeightTrend } from "@/lib/progress/weight-trend";
import { buildGoalContextSentence, buildWeeklyHeadline, buildWeeklyStorySentence } from "@/lib/progress/narrative";
import { getUserContext } from "@/lib/profile/context";
import { deriveMuscleMapModel } from "@/lib/profile/types";
import { requireOnboardedUser } from "@/lib/supabase/auth";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ProgressWeeklyPageProps {
  searchParams: Promise<{ start?: string }>;
}

export default async function ProgressWeeklyPage({
  searchParams,
}: ProgressWeeklyPageProps) {
  await requireOnboardedUser();
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
  const previousEnd = addDays(start, -1);

  const [
    reports,
    sleepLogs,
    previousSleepLogs,
    waterLogs,
    previousWaterLogs,
    weightLogs,
    weightBaseline,
    photos,
    userContext,
  ] = await Promise.all([
    getReportsInRange(previousStart, end),
    getSleepLogsInRange(start, end),
    getSleepLogsInRange(previousStart, previousEnd),
    getWaterLogsInRange(start, end),
    getWaterLogsInRange(previousStart, previousEnd),
    getWeightLogsInRange(start, end),
    getLatestWeightLogBefore(start),
    getPhotosInRange(start, end),
    getUserContext(),
  ]);
  const primaryGoal = userContext.profile?.primary_goal ?? null;

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

  const recoverySummary = computeRecoverySummary(sleepLogs, waterLogs);
  const recoveryInsights = computeRecoveryInsights(
    { sleepLogs, waterLogs },
    { sleepLogs: previousSleepLogs, waterLogs: previousWaterLogs },
  );
  const weightTrend = computeWeightTrend(weightLogs, weightBaseline, "week", primaryGoal);

  const headline = buildWeeklyHeadline(
    current.workoutsCompleted,
    recoveryInsights.every((insight) => !/fell|dropped/.test(insight)),
  );
  const storySentence = buildWeeklyStorySentence(
    current.workoutsCompleted,
    previous.workoutsCompleted,
    recoveryInsights,
  );
  const goalContextSentence = buildGoalContextSentence(primaryGoal);

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
      title: "Consistency",
      content: <ConsistencyTimeline days={days} pointsByDate={pointsByDate} />,
    },
    {
      title: "Muscle Balance",
      content: (
        <MuscleBalanceSection
          regionCounts={regionCounts}
          musclesTrainedByDay={thisWeekPoints.map((p) => p.musclesTrained)}
          distributionLabel="Weekly Distribution"
          muscleMapModel={deriveMuscleMapModel(userContext.profile?.biological_sex ?? null)}
        />
      ),
    },
    {
      title: "How You Recovered",
      content: (
        <RecoverySection
          avgSleepMinutes={recoverySummary.avgSleepMinutes}
          hydrationTargetHitDays={recoverySummary.hydrationTargetHitDays}
          totalDaysWithWater={recoverySummary.daysWithWater}
          insights={recoveryInsights}
        />
      ),
    },
    {
      title: "How Your Body Is Responding",
      content: (
        <BodyResponseSection
          weightTrend={weightTrend}
          photoCount={photos.length}
          periodLabel="week"
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

      <div className="flex flex-col gap-1">
        <p className="text-lg font-bold text-foreground">{headline}</p>
        <p className="text-sm text-muted-foreground">{storySentence}</p>
        {goalContextSentence && (
          <p className="text-sm text-muted-foreground">{goalContextSentence}</p>
        )}
      </div>

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
