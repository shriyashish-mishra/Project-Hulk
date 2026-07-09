import type { AiDailyReport } from "@/lib/nightly-report/types";
import type {
  CoachInsight,
  DailyTrendPoint,
  MuscleGroupCount,
  WeeklySummary,
} from "./types";

export function buildTrendPoints(reports: AiDailyReport[]): DailyTrendPoint[] {
  return reports.map((report) => ({
    date: report.report_date,
    nutritionScore: report.nutrition_score,
    workoutScore: report.workout_score,
    overallScore: report.overall_score,
    proteinG: report.parsed_json.protein_g,
    estimatedCalories: report.parsed_json.estimated_calories,
    musclesTrained: report.parsed_json.muscles_trained,
    coachSummary: report.coach_summary,
  }));
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
}

export function computeWeeklySummary(points: DailyTrendPoint[]): WeeklySummary {
  const workoutsCompleted = points.filter((p) => p.musclesTrained.length > 0).length;
  const restDays = points.length - workoutsCompleted;

  return {
    daysWithReports: points.length,
    avgProteinG: average(points.map((p) => p.proteinG)),
    avgCalories: average(points.map((p) => p.estimatedCalories)),
    avgNutritionScore: average(points.map((p) => p.nutritionScore)),
    avgWorkoutScore: average(points.map((p) => p.workoutScore)),
    workoutsCompleted,
    restDays,
  };
}

export function computeMuscleGroupCounts(
  points: DailyTrendPoint[],
): MuscleGroupCount[] {
  const counts = new Map<string, number>();
  for (const point of points) {
    for (const muscle of point.musclesTrained) {
      const key = muscle.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([muscle, count]) => ({ muscle, count }))
    .sort((a, b) => b.count - a.count || a.muscle.localeCompare(b.muscle));
}

const MIN_DAYS_FOR_COMPARISON = 2;
const SCORE_CHANGE_THRESHOLD = 3;
const RATIO_CHANGE_THRESHOLD = 0.05;

/** Deterministic week-over-week insights — no AI, just stored-report math. */
export function computeCoachInsights(
  thisWeek: DailyTrendPoint[],
  lastWeek: DailyTrendPoint[],
): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const current = computeWeeklySummary(thisWeek);
  const previous = computeWeeklySummary(lastWeek);
  const canCompare =
    current.daysWithReports >= MIN_DAYS_FOR_COMPARISON &&
    previous.daysWithReports >= MIN_DAYS_FOR_COMPARISON;

  if (canCompare && current.avgProteinG !== null && previous.avgProteinG !== null) {
    const ratio = (current.avgProteinG - previous.avgProteinG) / previous.avgProteinG;
    if (ratio >= RATIO_CHANGE_THRESHOLD) {
      insights.push({ text: "Protein intake has increased compared to last week." });
    } else if (ratio <= -RATIO_CHANGE_THRESHOLD) {
      insights.push({ text: "Protein intake has dropped compared to last week." });
    }
  }

  if (
    canCompare &&
    current.avgNutritionScore !== null &&
    previous.avgNutritionScore !== null
  ) {
    const diff = current.avgNutritionScore - previous.avgNutritionScore;
    if (diff >= SCORE_CHANGE_THRESHOLD) {
      insights.push({ text: "Nutrition consistency is improving." });
    } else if (diff <= -SCORE_CHANGE_THRESHOLD) {
      insights.push({
        text: "Nutrition consistency has slipped compared to last week.",
      });
    }
  }

  if (current.workoutsCompleted > 0) {
    if (canCompare) {
      if (current.workoutsCompleted > previous.workoutsCompleted) {
        insights.push({
          text: `You trained ${current.workoutsCompleted} times this week, up from ${previous.workoutsCompleted} last week.`,
        });
      } else if (current.workoutsCompleted < previous.workoutsCompleted) {
        insights.push({
          text: `You trained ${current.workoutsCompleted} times this week, down from ${previous.workoutsCompleted} last week.`,
        });
      } else {
        insights.push({
          text: `You matched last week with ${current.workoutsCompleted} workouts.`,
        });
      }
    } else {
      insights.push({
        text: `You trained ${current.workoutsCompleted} times this week.`,
      });
    }
  }

  const topMuscle = computeMuscleGroupCounts(thisWeek)[0];
  if (topMuscle && topMuscle.count > 1) {
    insights.push({
      text: `${topMuscle.muscle} has been trained ${topMuscle.count} times this week.`,
    });
  }

  return insights;
}
