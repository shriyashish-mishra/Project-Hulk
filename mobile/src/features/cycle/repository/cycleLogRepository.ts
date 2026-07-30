import type { SQLiteDatabase } from 'expo-sqlite';

import type { CycleLog } from '../types';

interface CycleLogRow {
  id: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

function mapRow(row: CycleLogRow): CycleLog {
  return { id: row.id, startDate: row.start_date, endDate: row.end_date, createdAt: row.created_at };
}

/** Most recent entries, newest first, bounded by `limit`. */
export async function getRecentLogs(db: SQLiteDatabase, limit: number): Promise<CycleLog[]> {
  const rows = await db.getAllAsync<CycleLogRow>(
    'SELECT * FROM cycle_logs ORDER BY start_date DESC LIMIT ?',
    limit,
  );
  return rows.map(mapRow);
}

/** The most recent entry that hasn't been closed out yet, if any — "a period is currently in progress." */
export async function getActiveLog(db: SQLiteDatabase): Promise<CycleLog | null> {
  const row = await db.getFirstAsync<CycleLogRow>(
    'SELECT * FROM cycle_logs WHERE end_date IS NULL ORDER BY start_date DESC LIMIT 1',
  );
  return row ? mapRow(row) : null;
}

export async function createLog(db: SQLiteDatabase, startDate: string): Promise<CycleLog> {
  const result = await db.runAsync('INSERT INTO cycle_logs (start_date) VALUES (?)', startDate);
  const row = await db.getFirstAsync<CycleLogRow>('SELECT * FROM cycle_logs WHERE id = ?', result.lastInsertRowId);
  if (!row) {
    throw new Error('createLog: row missing immediately after insert');
  }
  return mapRow(row);
}

export async function closeLog(db: SQLiteDatabase, id: number, endDate: string): Promise<CycleLog> {
  await db.runAsync('UPDATE cycle_logs SET end_date = ? WHERE id = ?', endDate, id);
  const row = await db.getFirstAsync<CycleLogRow>('SELECT * FROM cycle_logs WHERE id = ?', id);
  if (!row) {
    throw new Error('closeLog: row missing immediately after update');
  }
  return mapRow(row);
}

export async function deleteLog(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM cycle_logs WHERE id = ?', id);
}
