import type { SQLiteDatabase } from 'expo-sqlite';

import type { WorkoutLog } from '../types';

interface WorkoutLogRow {
  id: number;
  raw_text: string;
  logged_on: string;
  workout_type: string | null;
  duration_minutes: number | null;
  created_at: string;
}

function mapRow(row: WorkoutLogRow): WorkoutLog {
  return {
    id: row.id,
    loggedOn: row.logged_on,
    workoutType: row.workout_type,
    durationMinutes: row.duration_minutes,
    notes: row.raw_text,
    createdAt: row.created_at,
  };
}

export async function getWorkoutLogForDate(db: SQLiteDatabase, date: string): Promise<WorkoutLog | null> {
  const row = await db.getFirstAsync<WorkoutLogRow>('SELECT * FROM workout_logs WHERE logged_on = ?', date);
  return row ? mapRow(row) : null;
}

/** Most recent daily workout-log entries, newest first — backs the Workouts hub's "Recent Workouts" section, distinct from the template-based `workout_sessions` table. */
export async function getRecentWorkoutLogs(db: SQLiteDatabase, limit: number): Promise<WorkoutLog[]> {
  const rows = await db.getAllAsync<WorkoutLogRow>('SELECT * FROM workout_logs ORDER BY logged_on DESC LIMIT ?', limit);
  return rows.map(mapRow);
}

/** One entry per day — logging again replaces the day's entry rather than appending. */
export async function upsertWorkoutLog(
  db: SQLiteDatabase,
  date: string,
  workoutType: string | null,
  durationMinutes: number | null,
  notes: string,
): Promise<WorkoutLog> {
  await db.runAsync(
    `INSERT INTO workout_logs (raw_text, logged_on, workout_type, duration_minutes) VALUES (?, ?, ?, ?)
     ON CONFLICT (logged_on) DO UPDATE SET
       raw_text = excluded.raw_text,
       workout_type = excluded.workout_type,
       duration_minutes = excluded.duration_minutes`,
    notes,
    date,
    workoutType,
    durationMinutes,
  );
  const row = await db.getFirstAsync<WorkoutLogRow>('SELECT * FROM workout_logs WHERE logged_on = ?', date);
  if (!row) {
    throw new Error('upsertWorkoutLog: row missing immediately after insert');
  }
  return mapRow(row);
}
