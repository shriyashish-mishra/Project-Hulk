import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { addDays, getTodayDateString } from '@/core/utils';
import { AIReportService } from '@/features/ai/services';
import type { AIReport } from '@/features/ai/types';
import { ProfileService, type ProfileTargets } from '@/features/profile/services';
import { computeRegionCounts, type MuscleRegion } from '../utils/muscleRegions';

const WEEK_LENGTH_DAYS = 7;

export interface DayCalorieBalance {
  date: string;
  balanceKcal: number | null;
  hasReport: boolean;
}

export interface ProgressInsights {
  loading: boolean;
  todayReport: AIReport | null;
  targets: ProfileTargets | null;
  regionCounts: Map<MuscleRegion, number>;
  musclesTrainedByDay: string[][];
  weekCalorieBalance: DayCalorieBalance[];
}

/**
 * Aggregates the last 7 days of AI reports plus profile targets into
 * exactly what the Progress screen's muscle map, nutrient bars, and
 * calorie-balance row need — the mobile equivalent of the web app's
 * `lib/progress/stats.ts`, condensed onto one scrolling screen instead of
 * separate day/week routes.
 */
export function useProgressInsights(): ProgressInsights {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [todayReport, setTodayReport] = useState<AIReport | null>(null);
  const [targets, setTargets] = useState<ProfileTargets | null>(null);
  const [weekReports, setWeekReports] = useState<AIReport[]>([]);

  useEffect(() => {
    const today = getTodayDateString();
    const weekStart = addDays(today, -(WEEK_LENGTH_DAYS - 1));

    Promise.all([AIReportService.getRecentReports(db), ProfileService.getTargets(db)]).then(
      ([recentReports, resolvedTargets]) => {
        const withinWeek = recentReports.filter((report) => report.date >= weekStart && report.date <= today);
        setWeekReports(withinWeek);
        setTodayReport(withinWeek.find((report) => report.date === today) ?? recentReports[0] ?? null);
        setTargets(resolvedTargets);
        setLoading(false);
      },
    );
  }, [db]);

  const musclesTrainedByDay = weekReports.map((report) => report.musclesTrained ?? []);
  const regionCounts = computeRegionCounts(musclesTrainedByDay);

  const today = getTodayDateString();
  const weekCalorieBalance: DayCalorieBalance[] = Array.from({ length: WEEK_LENGTH_DAYS }, (_, index) => {
    const date = addDays(today, index - (WEEK_LENGTH_DAYS - 1));
    const report = weekReports.find((r) => r.date === date);
    return {
      date,
      balanceKcal: report?.calorieBalanceKcal ?? null,
      hasReport: report !== undefined,
    };
  });

  return { loading, todayReport, targets, regionCounts, musclesTrainedByDay, weekCalorieBalance };
}
