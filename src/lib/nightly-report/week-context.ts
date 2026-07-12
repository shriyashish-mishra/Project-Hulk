import { addDays, formatWeekdayShort, getWeekStart } from "@/lib/date";
import { getReportsInRange } from "@/lib/progress/queries";
import { buildTrendPoints, computePeriodSummary } from "@/lib/progress/stats";
import { ALL_MUSCLE_REGIONS, MUSCLE_REGION_LABEL, computeRegionCounts } from "@/lib/progress/muscle-map";

export interface WeekSoFarContext {
  weekdayLabel: string;
  daysRemainingInWeek: number;
  daysWithReports: number;
  workoutsCompleted: number;
  restDays: number;
  trainedRegionLabels: string[];
  untrainedRegionLabels: string[];
  avgProteinG: number | null;
  avgCalories: number | null;
}

/**
 * Everything already logged and AI-reported earlier THIS calendar week
 * (Monday up to, but not including, `date` — today's own data is already
 * detailed elsewhere in the prompt, this section exists so meal/workout
 * suggestions build on the week's pattern instead of treating each night
 * as if it started from zero). Built entirely from deterministic app data
 * — the same stats/muscle-map functions the Weekly Progress page uses —
 * so the same week produces the same context regardless of which AI reads
 * it, which is the point: consistency comes from what the app hands over,
 * not from the model.
 *
 * Only draws from days that already have an imported daily_ai_reports row;
 * a day logged but never generated/imported won't appear here, same
 * limitation the Weekly Progress page already has.
 */
export async function getWeekSoFarContext(date: string): Promise<WeekSoFarContext> {
  const weekStart = getWeekStart(date);
  const weekEnd = addDays(weekStart, 6);

  const priorReports = date === weekStart ? [] : await getReportsInRange(weekStart, addDays(date, -1));
  const points = buildTrendPoints(priorReports);
  const summary = computePeriodSummary(points);
  const regionCounts = computeRegionCounts(points.map((p) => p.musclesTrained));

  const trainedRegionLabels = ALL_MUSCLE_REGIONS.filter((r) => (regionCounts.get(r) ?? 0) > 0).map(
    (r) => MUSCLE_REGION_LABEL[r],
  );
  const untrainedRegionLabels = ALL_MUSCLE_REGIONS.filter((r) => (regionCounts.get(r) ?? 0) === 0).map(
    (r) => MUSCLE_REGION_LABEL[r],
  );

  const daysRemainingInWeek = Math.max(
    0,
    Math.round((Date.parse(weekEnd) - Date.parse(date)) / 86_400_000),
  );

  return {
    weekdayLabel: formatWeekdayShort(new Date(`${date}T00:00:00`)),
    daysRemainingInWeek,
    daysWithReports: summary.daysWithReports,
    workoutsCompleted: summary.workoutsCompleted,
    restDays: summary.restDays,
    trainedRegionLabels,
    untrainedRegionLabels,
    avgProteinG: summary.avgProteinG,
    avgCalories: summary.avgCalories,
  };
}
