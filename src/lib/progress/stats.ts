import { addDays, formatWeekRangeLabel, getWeekStart } from "@/lib/date";
import type { AiDailyReport } from "@/lib/nightly-report/types";
import {
  ALL_MUSCLE_REGIONS,
  MUSCLE_REGION_LABEL,
  type MuscleRegion,
} from "./muscle-map";
import { computeProteinGoal } from "./weekly-plan";
import type {
  CoachInsight,
  DailyTrendPoint,
  MuscleGroupCount,
  PeriodSummary,
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

/** Aggregate stats over any date range — a week, a month, whatever `points` covers. */
export function computePeriodSummary(points: DailyTrendPoint[]): PeriodSummary {
  const workoutsCompleted = points.filter((p) => p.musclesTrained.length > 0).length;
  const restDays = points.length - workoutsCompleted;

  return {
    daysWithReports: points.length,
    avgProteinG: average(points.map((p) => p.proteinG)),
    avgCalories: average(points.map((p) => p.estimatedCalories)),
    avgNutritionScore: average(points.map((p) => p.nutritionScore)),
    avgWorkoutScore: average(points.map((p) => p.workoutScore)),
    avgOverallScore: average(points.map((p) => p.overallScore)),
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

/** Deterministic period-over-period insights — no AI, just stored-report math. */
export function computeCoachInsights(
  current: DailyTrendPoint[],
  previous: DailyTrendPoint[],
): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const currentSummary = computePeriodSummary(current);
  const previousSummary = computePeriodSummary(previous);
  const canCompare =
    currentSummary.daysWithReports >= MIN_DAYS_FOR_COMPARISON &&
    previousSummary.daysWithReports >= MIN_DAYS_FOR_COMPARISON;

  if (
    canCompare &&
    currentSummary.avgProteinG !== null &&
    previousSummary.avgProteinG !== null
  ) {
    const ratio =
      (currentSummary.avgProteinG - previousSummary.avgProteinG) /
      previousSummary.avgProteinG;
    if (ratio >= RATIO_CHANGE_THRESHOLD) {
      insights.push({ text: "Protein intake has increased compared to last period." });
    } else if (ratio <= -RATIO_CHANGE_THRESHOLD) {
      insights.push({ text: "Protein intake has dropped compared to last period." });
    }
  }

  if (
    canCompare &&
    currentSummary.avgNutritionScore !== null &&
    previousSummary.avgNutritionScore !== null
  ) {
    const diff = currentSummary.avgNutritionScore - previousSummary.avgNutritionScore;
    if (diff >= SCORE_CHANGE_THRESHOLD) {
      insights.push({ text: "Nutrition consistency is improving." });
    } else if (diff <= -SCORE_CHANGE_THRESHOLD) {
      insights.push({
        text: "Nutrition consistency has slipped compared to last period.",
      });
    }
  }

  if (currentSummary.workoutsCompleted > 0) {
    if (canCompare) {
      if (currentSummary.workoutsCompleted > previousSummary.workoutsCompleted) {
        insights.push({
          text: `You trained ${currentSummary.workoutsCompleted} times, up from ${previousSummary.workoutsCompleted} last period.`,
        });
      } else if (currentSummary.workoutsCompleted < previousSummary.workoutsCompleted) {
        insights.push({
          text: `You trained ${currentSummary.workoutsCompleted} times, down from ${previousSummary.workoutsCompleted} last period.`,
        });
      } else {
        insights.push({
          text: `You matched last period with ${currentSummary.workoutsCompleted} workouts.`,
        });
      }
    } else {
      insights.push({
        text: `You trained ${currentSummary.workoutsCompleted} times.`,
      });
    }
  }

  const topMuscle = computeMuscleGroupCounts(current)[0];
  if (topMuscle && topMuscle.count > 1) {
    insights.push({
      text: `${topMuscle.muscle} has been trained ${topMuscle.count} times.`,
    });
  }

  return insights;
}

/** Longest run of consecutive dates with activity, anywhere within [rangeStart, rangeEnd]. */
export function computeLongestStreak(
  datesWithActivity: Set<string>,
  rangeStart: string,
  rangeEnd: string,
): number {
  let longest = 0;
  let current = 0;
  let cursor = rangeStart;

  while (cursor <= rangeEnd) {
    if (datesWithActivity.has(cursor)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
    cursor = addDays(cursor, 1);
  }

  return longest;
}

export interface BestWeek {
  label: string;
  avgScore: number;
}

/** The Mon–Sun week (overlapping the given month) with the highest average overall score. */
export function computeBestWeek(
  points: DailyTrendPoint[],
  monthStart: string,
  monthEnd: string,
): BestWeek | null {
  const scoreByDate = new Map(points.map((p) => [p.date, p.overallScore]));

  let best: BestWeek | null = null;
  let weekStart = getWeekStart(monthStart);

  while (weekStart <= monthEnd) {
    const weekEnd = addDays(weekStart, 6);
    const scoresInMonth: number[] = [];
    let cursor = weekStart;
    while (cursor <= weekEnd) {
      if (cursor >= monthStart && cursor <= monthEnd) {
        const score = scoreByDate.get(cursor);
        if (score !== undefined) scoresInMonth.push(score);
      }
      cursor = addDays(cursor, 1);
    }

    const avgScore = average(scoresInMonth);
    if (avgScore !== null && (best === null || avgScore > best.avgScore)) {
      best = { label: formatWeekRangeLabel(weekStart, weekEnd), avgScore };
    }

    weekStart = addDays(weekStart, 7);
  }

  return best;
}

export interface MonthlyReflection {
  achievements: string[];
  areasToImprove: string[];
  priorities: string[];
}

const CONSISTENCY_ACHIEVEMENT_THRESHOLD = 80;
const STREAK_ACHIEVEMENT_THRESHOLD = 7;
const LOW_SCORE_THRESHOLD = 70;

/** Deterministic monthly reflection — no AI, just thresholds over stored-report math. */
export function computeMonthlyReflection(
  current: DailyTrendPoint[],
  previous: DailyTrendPoint[],
  regionCounts: Map<MuscleRegion, number>,
  longestStreakDays: number,
  consistencyPct: number,
): MonthlyReflection {
  const achievements: string[] = [];
  const areasToImprove: string[] = [];
  const priorities: string[] = [];

  const currentSummary = computePeriodSummary(current);
  const previousSummary = computePeriodSummary(previous);
  const canCompare =
    currentSummary.daysWithReports >= MIN_DAYS_FOR_COMPARISON &&
    previousSummary.daysWithReports >= MIN_DAYS_FOR_COMPARISON;

  if (longestStreakDays >= STREAK_ACHIEVEMENT_THRESHOLD) {
    achievements.push(`${longestStreakDays}-day logging streak`);
  }
  if (consistencyPct >= CONSISTENCY_ACHIEVEMENT_THRESHOLD) {
    achievements.push(`${Math.round(consistencyPct)}% consistency`);
  }
  if (
    canCompare &&
    currentSummary.avgProteinG !== null &&
    previousSummary.avgProteinG !== null &&
    currentSummary.avgProteinG > previousSummary.avgProteinG
  ) {
    achievements.push("Increased average protein intake");
  }
  if (
    canCompare &&
    currentSummary.avgWorkoutScore !== null &&
    previousSummary.avgWorkoutScore !== null &&
    currentSummary.avgWorkoutScore > previousSummary.avgWorkoutScore
  ) {
    achievements.push("Improved workout consistency");
  }

  const neglectedRegions = ALL_MUSCLE_REGIONS.filter(
    (region) => (regionCounts.get(region) ?? 0) === 0,
  ).map((region) => MUSCLE_REGION_LABEL[region]);

  if (neglectedRegions.length > 0) {
    areasToImprove.push(`${neglectedRegions.join(" and ")} saw no direct work`);
    priorities.push(`Add dedicated ${neglectedRegions[0]} volume next month`);
  }
  if (currentSummary.avgWorkoutScore !== null && currentSummary.avgWorkoutScore < LOW_SCORE_THRESHOLD) {
    areasToImprove.push("Workout consistency dipped below target");
  }
  if (currentSummary.avgNutritionScore !== null && currentSummary.avgNutritionScore < LOW_SCORE_THRESHOLD) {
    areasToImprove.push("Nutrition consistency dipped below target");
  }

  const proteinGoal = computeProteinGoal(currentSummary.avgProteinG);
  if (currentSummary.avgProteinG === null || currentSummary.avgProteinG < proteinGoal) {
    priorities.push(`Push average protein toward ${proteinGoal}g/day`);
  }
  priorities.push("Maintain consistency and stay injury-free");

  return { achievements, areasToImprove, priorities };
}

/** A short deterministic reflection paragraph — no AI, just stitched-together stats. */
export function buildCoachReflection(
  current: PeriodSummary,
  previous: PeriodSummary,
  longestStreakDays: number,
  consistencyPct: number,
): string {
  const sentences: string[] = [
    `You trained ${current.workoutsCompleted} times this month with ${Math.round(consistencyPct)}% consistency.`,
  ];

  if (longestStreakDays >= 3) {
    sentences.push(`Your longest streak reached ${longestStreakDays} days.`);
  }

  if (current.avgProteinG !== null && previous.avgProteinG !== null) {
    const diff = Math.round(current.avgProteinG - previous.avgProteinG);
    if (diff > 0) {
      sentences.push(
        `Protein averaged ${current.avgProteinG}g, up ${diff}g from last month.`,
      );
    } else if (diff < 0) {
      sentences.push(
        `Protein averaged ${current.avgProteinG}g, down ${Math.abs(diff)}g from last month.`,
      );
    }
  }

  return sentences.join(" ");
}
