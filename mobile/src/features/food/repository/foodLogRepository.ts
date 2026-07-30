import type { SQLiteDatabase } from 'expo-sqlite';

import type { FoodLog, MealType } from '../types';

interface FoodLogRow {
  id: number;
  meal_type: MealType;
  raw_text: string;
  logged_on: string;
  created_at: string;
}

function mapRow(row: FoodLogRow): FoodLog {
  return {
    id: row.id,
    mealType: row.meal_type,
    rawText: row.raw_text,
    loggedOn: row.logged_on,
    createdAt: row.created_at,
  };
}

/** Every meal logged for a date, in the order they were saved. */
export async function getFoodLogsForDate(db: SQLiteDatabase, date: string): Promise<FoodLog[]> {
  const rows = await db.getAllAsync<FoodLogRow>(
    'SELECT * FROM food_logs WHERE logged_on = ? ORDER BY id ASC',
    date,
  );
  return rows.map(mapRow);
}

/** One entry per meal type per day — logging again edits that day's note rather than appending a new one. */
export async function upsertFoodLog(
  db: SQLiteDatabase,
  date: string,
  mealType: MealType,
  rawText: string,
): Promise<FoodLog> {
  await db.runAsync(
    `INSERT INTO food_logs (meal_type, raw_text, logged_on) VALUES (?, ?, ?)
     ON CONFLICT (meal_type, logged_on) DO UPDATE SET raw_text = excluded.raw_text`,
    mealType,
    rawText,
    date,
  );
  const row = await db.getFirstAsync<FoodLogRow>(
    'SELECT * FROM food_logs WHERE meal_type = ? AND logged_on = ?',
    mealType,
    date,
  );
  if (!row) {
    throw new Error('upsertFoodLog: row missing immediately after insert');
  }
  return mapRow(row);
}

export async function deleteFoodLog(db: SQLiteDatabase, date: string, mealType: MealType): Promise<void> {
  await db.runAsync('DELETE FROM food_logs WHERE logged_on = ? AND meal_type = ?', date, mealType);
}
