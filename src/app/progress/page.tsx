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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly summary</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklySummaryTiles summary={weeklySummary} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreTrendChart days={last7Days} pointsByDate={pointsByDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition trends</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutConsistencyStrip days={last7Days} pointsByDate={pointsByDate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Muscle groups trained this week</CardTitle>
        </CardHeader>
        <CardContent>
          <MuscleGroupsCard counts={muscleGroupCounts} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coach memory</CardTitle>
        </CardHeader>
        <CardContent>
          <CoachMemoryCard insights={coachInsights} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI coaching history</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportHistoryList reports={reports} />
        </CardContent>
      </Card>
    </div>
  );
}
