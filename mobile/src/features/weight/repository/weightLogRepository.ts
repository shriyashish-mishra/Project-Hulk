import type { SQLiteDatabase } from 'expo-sqlite';

import type { WeightLog } from '../types';

interface WeightLogRow {
  id: number;
  measured_on: string;
  weight_kg: number;
  created_at: string;
}

function mapRow(row: WeightLogRow): WeightLog {
  return { id: row.id, measuredOn: row.measured_on, weightKg: row.weight_kg, createdAt: row.created_at };
}

/** Most recent weigh-in overall — used wherever "current weight" feeds a calculation (targets, trends), regardless of whether today itself has an entry. */
export async function getLatestWeightLog(db: SQLiteDatabase): Promise<WeightLog | null> {
  const row = await db.getFirstAsync<WeightLogRow>(
    'SELECT * FROM weight_logs ORDER BY measured_on DESC LIMIT 1',
  );
  return row ? mapRow(row) : null;
}

/** The entry for one exact date, or `null` if that day has none — distinct from `getLatestWeightLog`, which returns the most recent entry regardless of date. Backs the Journal dashboard's Weight row, which must show "not logged" for a day with no entry even if a more recent one exists. */
export async function getWeightLogForDate(db: SQLiteDatabase, date: string): Promise<WeightLog | null> {
  const row = await db.getFirstAsync<WeightLogRow>('SELECT * FROM weight_logs WHERE measured_on = ?', date);
  return row ? mapRow(row) : null;
}

/** One entry per day — logging again for the same date overwrites it rather than creating a duplicate. */
export async function upsertWeightLog(db: SQLiteDatabase, date: string, weightKg: number): Promise<WeightLog> {
  await db.runAsync(
    `INSERT INTO weight_logs (measured_on, weight_kg) VALUES (?, ?)
     ON CONFLICT (measured_on) DO UPDATE SET weight_kg = excluded.weight_kg`,
    date,
    weightKg,
  );
  const row = await db.getFirstAsync<WeightLogRow>(
    'SELECT * FROM weight_logs WHERE measured_on = ?',
    date,
  );
  if (!row) {
    throw new Error('upsertWeightLog: row missing immediately after insert');
  }
  return mapRow(row);
}

/** Most recent entries, newest first, bounded by `limit` — never a full scan of years of history. */
export async function getWeightHistory(db: SQLiteDatabase, limit: number): Promise<WeightLog[]> {
  const rows = await db.getAllAsync<WeightLogRow>(
    'SELECT * FROM weight_logs ORDER BY measured_on DESC LIMIT ?',
    limit,
  );
  return rows.map(mapRow);
}
