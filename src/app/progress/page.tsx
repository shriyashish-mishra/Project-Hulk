import {
  CalendarCheck2,
  Dumbbell,
  Flame,
  History,
  ListChecks,
  Sparkle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoachMemoryCard } from "@/components/progress/coach-memory-card";
import { MuscleGroupsCard } from "@/components/progress/muscle-groups-card";
import { ReportHistoryList } from "@/components/progress/report-history-list";
import { ScoreTrendChart } from "@/components/progress/score-trend-chart";
import { SparklineTile } from "@/components/progress/sparkline-tile";
import { WeeklySummaryTiles } from "@/components/progress/weekly-summary-tiles";
import { WorkoutConsistencyStrip } from "@/components/progress/workout-consistency-strip";
import { getDaysAgoDateString, getLocalDateString } from "@/lib/date";
import { getReportsInRange } from "@/lib/progress/queries";
import {
  buildTrendPoints,
  computeCoachInsights,
  computeMuscleGroupCounts,
  computeWeeklySummary,
} from "@/lib/progress/stats";

export default async function ProgressPage() {
  const today = getLocalDateString();
  const rangeStart = getDaysAgoDateString(13);
  const thisWeekStart = getDaysAgoDateString(6);

  const reports = await getReportsInRange(rangeStart, today);
  const allPoints = buildTrendPoints(reports);

  const thisWeekPoints = allPoints.filter((p) => p.date >= thisWeekStart);
  const lastWeekPoints = allPoints.filter((p) => p.date < thisWeekStart);
  const pointsByDate = new Map(allPoints.map((p) => [p.date, p]));
  const last7Days = Array.from({ length: 7 }, (_, i) => getDaysAgoDateString(6 - i));

  const weeklySummary = computeWeeklySummary(thisWeekPoints);
  const muscleGroupCounts = computeMuscleGroupCounts(thisWeekPoints);
  const coachInsights = computeCoachInsights(thisWeekPoints, lastWeekPoints);

  const proteinSparkline = last7Days.map((date) => ({
    value: pointsByDate.get(date)?.proteinG ?? null,
  }));
  const calorieSparkline = last7Days.map((date) => ({
    value: pointsByDate.get(date)?.estimatedCalories ?? null,
  }));

  const sections = [
    {
      title: "Weekly summary",
      icon: ListChecks,
      content: <WeeklySummaryTiles summary={weeklySummary} />,
    },
    {
      title: "Score trends",
      icon: TrendingUp,
      content: <ScoreTrendChart days={last7Days} pointsByDate={pointsByDate} />,
    },
    {
      title: "Nutrition trends",
      icon: Flame,
      content: (
        <div className="grid grid-cols-2 gap-3">
          <SparklineTile
            label="Protein"
            value={weeklySummary.avgProteinG}
            unit="g avg"
            data={proteinSparkline}
            color="var(--success)"
          />
          <SparklineTile
            label="Calories"
            value={weeklySummary.avgCalories}
            unit="kcal avg"
            data={calorieSparkline}
            color="var(--warning)"
          />
        </div>
      ),
    },
    {
      title: "Workout consistency",
      icon: CalendarCheck2,
      content: (
        <WorkoutConsistencyStrip days={last7Days} pointsByDate={pointsByDate} />
      ),
    },
    {
      title: "Muscle groups trained this week",
      icon: Dumbbell,
      content: <MuscleGroupsCard counts={muscleGroupCounts} />,
    },
    {
      title: "Coach memory",
      icon: Sparkle,
      content: <CoachMemoryCard insights={coachInsights} />,
    },
    {
      title: "AI coaching history",
      icon: History,
      content: <ReportHistoryList reports={reports} />,
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <header>
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Last 7 days
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-foreground">
          Progress
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        {sections.map(({ title, icon: Icon, content }, index) => (
          <Card
            key={title}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <Icon className="size-4 text-primary" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
