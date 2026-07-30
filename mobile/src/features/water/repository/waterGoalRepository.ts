import type { SQLiteDatabase } from 'expo-sqlite';

import type { WaterGoal } from '../types';

interface WaterGoalRow {
  id: number;
  entry_date: string;
  goal_ml: number;
  updated_at: string;
}

function mapRow(row: WaterGoalRow): WaterGoal {
  return { id: row.id, entryDate: row.entry_date, goalMl: row.goal_ml, updatedAt: row.updated_at };
}

/** The most recently set goal on or before a date — lets a new day inherit whatever the user last configured, instead of resetting to a default every day. */
export async function getMostRecentGoal(db: SQLiteDatabase, date: string): Promise<WaterGoal | null> {
  const row = await db.getFirstAsync<WaterGoalRow>(
    'SELECT * FROM water_goals WHERE entry_date <= ? ORDER BY entry_date DESC LIMIT 1',
    date,
  );
  return row ? mapRow(row) : null;
}

export async function setGoalForDate(db: SQLiteDatabase, date: string, goalMl: number): Promise<WaterGoal> {
  await db.runAsync(
    `INSERT INTO water_goals (entry_date, goal_ml) VALUES (?, ?)
     ON CONFLICT (entry_date) DO UPDATE SET goal_ml = excluded.goal_ml, updated_at = datetime('now')`,
    date,
    goalMl,
  );
  const row = await db.getFirstAsync<WaterGoalRow>('SELECT * FROM water_goals WHERE entry_date = ?', date);
  if (!row) {
    throw new Error('setGoalForDate: row missing immediately after insert');
  }
  return mapRow(row);
}
