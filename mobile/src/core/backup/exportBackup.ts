import type { SQLiteDatabase } from 'expo-sqlite';
import type { BackupPayload, BackupRow } from './types';

/**
 * Every table except `progress_photos` — that one's rows are just pointers
 * to image files in this install's private storage, which a JSON export
 * can't carry along. Order doesn't matter for export (only import cares
 * about foreign-key dependency order).
 */
const EXPORTED_TABLES = [
  'food_logs',
  'workout_logs',
  'water_logs',
  'weight_logs',
  'journal_entries',
  'journal_drafts',
  'water_entries',
  'water_goals',
  'sleep_logs',
  'cycle_settings',
  'cycle_logs',
  'ai_reports',
  'exercise_library',
  'workout_templates',
  'template_exercises',
  'workout_sessions',
  'workout_session_exercises',
] as const;

/**
 * Dumps every table to one JSON payload — the migration path for moving
 * data between two separately-sandboxed installs of this app (e.g. Expo
 * Go → a standalone build), since Android gives no other way for one app
 * to read another's private storage. Meant to be copied via the clipboard,
 * not stored — nothing here is encrypted.
 */
export async function exportBackup(db: SQLiteDatabase): Promise<string> {
  const tables: Record<string, BackupRow[]> = {};
  for (const table of EXPORTED_TABLES) {
    tables[table] = await db.getAllAsync<BackupRow>(`SELECT * FROM ${table}`);
  }

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tables,
  };
  return JSON.stringify(payload);
}
