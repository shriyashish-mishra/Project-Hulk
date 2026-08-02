import type { SQLiteDatabase } from 'expo-sqlite';

import { getLatestWeightLog, getWeightHistory, getWeightLogForDate, upsertWeightLog } from '../repository';
import type { WeightLog } from '../types';

const HISTORY_LIMIT = 30;
const TREND_WINDOW = 7;
const FLAT_THRESHOLD_KG = 0.05;

export type TrendDirection = 'up' | 'down' | 'flat';

export interface WeightTrend {
  direction: TrendDirection;
  deltaKg: number;
}

export interface WeightHistoryWithTrend {
  history: WeightLog[];
  /** `null` when there isn't enough history yet to say anything about a trend. */
  trend: WeightTrend | null;
}

function computeTrend(history: WeightLog[]): WeightTrend | null {
  if (history.length < 2) return null;
  const latest = history[0];
  const comparison = history[Math.min(TREND_WINDOW - 1, history.length - 1)];
  const deltaKg = Number((latest.weightKg - comparison.weightKg).toFixed(1));
  const direction: TrendDirection = deltaKg > FLAT_THRESHOLD_KG ? 'up' : deltaKg < -FLAT_THRESHOLD_KG ? 'down' : 'flat';
  return { direction, deltaKg };
}

/**
 * Weight's business logic. The trend here is deliberately simple —
 * latest vs. up to seven entries back — not a smoothed average or a
 * regression line. "Reliable tracking," not advanced analytics, is the
 * explicit goal for this phase.
 */
export const WeightService = {
  async getLatest(db: SQLiteDatabase): Promise<WeightLog | null> {
    return getLatestWeightLog(db);
  },

  async getForDate(db: SQLiteDatabase, date: string): Promise<WeightLog | null> {
    return getWeightLogForDate(db, date);
  },

  async getHistoryWithTrend(db: SQLiteDatabase): Promise<WeightHistoryWithTrend> {
    const history = await getWeightHistory(db, HISTORY_LIMIT);
    return { history, trend: computeTrend(history) };
  },

  async saveWeight(db: SQLiteDatabase, date: string, weightKg: number): Promise<WeightLog> {
    return upsertWeightLog(db, date, weightKg);
  },
};
