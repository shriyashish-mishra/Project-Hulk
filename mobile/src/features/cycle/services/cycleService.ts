import type { SQLiteDatabase } from 'expo-sqlite';

import {
  closeLog,
  createLog,
  deleteLog,
  getActiveLog,
  getRecentLogs,
  isCycleTrackingEnabled,
  setCycleTrackingEnabled,
} from '../repository';
import type { CycleLog } from '../types';

const RECENT_LOGS_LIMIT = 12;

/**
 * Cycle's business logic — deliberately the thinnest service in the app.
 * This is a foundation: manual start/end logging behind an opt-in
 * setting, nothing else. No phase calculation, no predictions, no
 * notifications — those are explicitly future AI-insights work once
 * there's a real reason to build them, not assumptions baked in now.
 */
export const CycleService = {
  async isEnabled(db: SQLiteDatabase): Promise<boolean> {
    return isCycleTrackingEnabled(db);
  },

  async setEnabled(db: SQLiteDatabase, enabled: boolean): Promise<void> {
    await setCycleTrackingEnabled(db, enabled);
  },

  async getActivePeriod(db: SQLiteDatabase): Promise<CycleLog | null> {
    return getActiveLog(db);
  },

  async getRecentPeriods(db: SQLiteDatabase): Promise<CycleLog[]> {
    return getRecentLogs(db, RECENT_LOGS_LIMIT);
  },

  /** Starts a new period — a no-op if one is already in progress, rather than allowing two overlapping entries. */
  async startPeriod(db: SQLiteDatabase, startDate: string): Promise<CycleLog> {
    const active = await getActiveLog(db);
    if (active) return active;
    return createLog(db, startDate);
  },

  /** Closes out whatever period is currently in progress, if any. */
  async endPeriod(db: SQLiteDatabase, endDate: string): Promise<CycleLog | null> {
    const active = await getActiveLog(db);
    if (!active) return null;
    return closeLog(db, active.id, endDate);
  },

  /** Removes a mistakenly-logged entry entirely — not a soft delete, since there's no audit trail concept here. */
  async deletePeriod(db: SQLiteDatabase, id: number): Promise<void> {
    await deleteLog(db, id);
  },
};
