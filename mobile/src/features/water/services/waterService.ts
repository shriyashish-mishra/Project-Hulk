import type { SQLiteDatabase } from 'expo-sqlite';

import { addEntry, deleteLastEntry, getEntriesForDate, getMostRecentGoal, getTotalMlForDate, setGoalForDate } from '../repository';
import type { WaterEntry } from '../types';

const DEFAULT_GOAL_ML = 2000;

export interface WaterSummary {
  totalMl: number;
  goalMl: number;
  entries: WaterEntry[];
}

/**
 * Water's business logic. Owns what "the goal" means (inherited from the
 * most recently configured day, defaulting to 2L for a brand-new
 * install) and the fact that totals are always derived, never stored.
 */
export const WaterService = {
  async getSummary(db: SQLiteDatabase, date: string): Promise<WaterSummary> {
    const [entries, totalMl, goal] = await Promise.all([
      getEntriesForDate(db, date),
      getTotalMlForDate(db, date),
      getMostRecentGoal(db, date),
    ]);
    return { totalMl, goalMl: goal?.goalMl ?? DEFAULT_GOAL_ML, entries };
  },

  async addWater(db: SQLiteDatabase, date: string, amountMl: number): Promise<void> {
    await addEntry(db, date, amountMl);
  },

  /** Undoes the single most recent addition for the date — a no-op if there's nothing to undo. */
  async undoLast(db: SQLiteDatabase, date: string): Promise<void> {
    await deleteLastEntry(db, date);
  },

  async setGoal(db: SQLiteDatabase, date: string, goalMl: number): Promise<void> {
    await setGoalForDate(db, date, goalMl);
  },
};
