import type { SQLiteDatabase } from 'expo-sqlite';

import type { SleepLog, SleepQuality } from '../types';

interface SleepLogRow {
  id: number;
  logged_on: string;
  bedtime: string | null;
  wake_time: string | null;
  duration_minutes: number | null;
  quality: SleepQuality | null;
  created_at: string;
}

function mapRow(row: SleepLogRow): SleepLog {
  return {
    id: row.id,
    loggedOn: row.logged_on,
    bedtime: row.bedtime,
    wakeTime: row.wake_time,
    durationMinutes: row.duration_minutes,
    quality: row.quality,
    createdAt: row.created_at,
  };
}

export async function getSleepLogForDate(db: SQLiteDatabase, date: string): Promise<SleepLog | null> {
  const row = await db.getFirstAsync<SleepLogRow>('SELECT * FROM sleep_logs WHERE logged_on = ?', date);
  return row ? mapRow(row) : null;
}

/** One entry per night — logging again replaces it rather than appending. */
export async function upsertSleepLog(
  db: SQLiteDatabase,
  date: string,
  bedtime: string | null,
  wakeTime: string | null,
  durationMinutes: number | null,
  quality: SleepQuality | null,
): Promise<SleepLog> {
  await db.runAsync(
    `INSERT INTO sleep_logs (logged_on, bedtime, wake_time, duration_minutes, quality) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (logged_on) DO UPDATE SET
       bedtime = excluded.bedtime,
       wake_time = excluded.wake_time,
       duration_minutes = excluded.duration_minutes,
       quality = excluded.quality`,
    date,
    bedtime,
    wakeTime,
    durationMinutes,
    quality,
  );
  const row = await db.getFirstAsync<SleepLogRow>('SELECT * FROM sleep_logs WHERE logged_on = ?', date);
  if (!row) {
    throw new Error('upsertSleepLog: row missing immediately after insert');
  }
  return mapRow(row);
}
