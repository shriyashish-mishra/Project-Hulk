import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { addDays } from '@/core/utils';
import { AIReportService } from '@/features/ai/services';
import type { AIReport } from '@/features/ai/types';
import { ProfileService, type ProfileTargets } from '@/features/profile/services';
import { computeRegionCounts, type MuscleRegion } from '../utils/muscleRegions';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DayCalorieBalance {
  date: string;
  balanceKcal: number | null;
  hasReport: boolean;
}

export interface ProgressInsights {
  loading: boolean;
  /** The report for `focusDate` specifically (Daily view's report-detail), or `null` if that day has none. */
  focusReport: AIReport | null;
  /** Every report in the window, oldest first — lets Weekly/Monthly compute their own score-average tiles without a second query. */
  reports: AIReport[];
  targets: ProfileTargets | null;
  regionCounts: Map<MuscleRegion, number>;
  musclesTrainedByDay: string[][];
  calorieBalance: DayCalorieBalance[];
}

/**
 * Aggregates every AI report in `[windowStart, windowEnd]` plus profile
 * targets into what Progress's muscle map, nutrient bars, and
 * calorie-balance row need — generalized from a single hardcoded "last 7
 * days" so Daily (a one-day window), Weekly (7 days), and Monthly (a
 * calendar month) can all share this one hook, matching the web app's
 * `lib/progress/stats.ts` computed per-period instead of once for "today."
 */
export function useProgressInsights(
  windowStart: string,
  windowEnd: string,
  focusDate: string = windowEnd,
): ProgressInsights {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [windowReports, setWindowReports] = useState<AIReport[]>([]);
  const [targets, setTargets] = useState<ProfileTargets | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([AIReportService.getReportsForRange(db, windowStart, windowEnd), ProfileService.getTargets(db)]).then(
      ([reports, resolvedTargets]) => {
        if (cancelled) return;
        setWindowReports(reports);
        setTargets(resolvedTargets);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [db, windowStart, windowEnd]);

  const focusReport = windowReports.find((report) => report.date === focusDate) ?? null;
  const musclesTrainedByDay = windowReports.map((report) => report.musclesTrained ?? []);
  const regionCounts = computeRegionCounts(musclesTrainedByDay);

  const dayCount =
    Math.round((new Date(`${windowEnd}T00:00:00`).getTime() - new Date(`${windowStart}T00:00:00`).getTime()) / DAY_MS) +
    1;
  const calorieBalance: DayCalorieBalance[] = Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(windowStart, index);
    const report = windowReports.find((r) => r.date === date);
    return {
      date,
      balanceKcal: report?.calorieBalanceKcal ?? null,
      hasReport: report !== undefined,
    };
  });

  return { loading, focusReport, reports: windowReports, targets, regionCounts, musclesTrainedByDay, calorieBalance };
}
