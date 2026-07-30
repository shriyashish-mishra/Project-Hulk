import type { SQLiteDatabase } from 'expo-sqlite';

import type { WaterEntry } from '../types';

interface WaterEntryRow {
  id: number;
  entry_date: string;
  amount_ml: number;
  created_at: string;
}

function mapRow(row: WaterEntryRow): WaterEntry {
  return { id: row.id, entryDate: row.entry_date, amountMl: row.amount_ml, createdAt: row.created_at };
}

/** All of a date's entries, oldest first — bounded to a single day, never a full-table scan. */
export async function getEntriesForDate(db: SQLiteDatabase, date: string): Promise<WaterEntry[]> {
  const rows = await db.getAllAsync<WaterEntryRow>(
    'SELECT * FROM water_entries WHERE entry_date = ? ORDER BY id ASC',
    date,
  );
  return rows.map(mapRow);
}

/** The day's total, computed live from its entries — there is no separate stored counter that could drift out of sync. */
export async function getTotalMlForDate(db: SQLiteDatabase, date: string): Promise<number> {
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount_ml) AS total FROM water_entries WHERE entry_date = ?',
    date,
  );
  return row?.total ?? 0;
}

export async function addEntry(db: SQLiteDatabase, date: string, amountMl: number): Promise<WaterEntry> {
  const result = await db.runAsync(
    'INSERT INTO water_entries (entry_date, amount_ml) VALUES (?, ?)',
    date,
    amountMl,
  );
  const row = await db.getFirstAsync<WaterEntryRow>(
    'SELECT * FROM water_entries WHERE id = ?',
    result.lastInsertRowId,
  );
  if (!row) {
    throw new Error('addEntry: row missing immediately after insert');
  }
  return mapRow(row);
}

/** Removes the single most recently added entry for a date — "undo," not a bulk clear. */
export async function deleteLastEntry(db: SQLiteDatabase, date: string): Promise<void> {
  await db.runAsync(
    'DELETE FROM water_entries WHERE id = (SELECT id FROM water_entries WHERE entry_date = ? ORDER BY id DESC LIMIT 1)',
    date,
  );
}
