import type { SQLiteDatabase } from 'expo-sqlite';

import { getSleepLogForDate, upsertSleepLog } from '../repository';
import type { SleepLog, SleepQuality } from '../types';
import { isValidTimeFormat } from '../utils';

export interface SleepInput {
  bedtime: string | null;
  wakeTime: string | null;
  quality: SleepQuality | null;
}

const MINUTES_PER_DAY = 24 * 60;

function parseTimeToMinutes(time: string): number | null {
  if (!isValidTimeFormat(time)) return null;
  const [hours, minutes] = time.trim().split(':').map(Number);
  return hours * 60 + minutes;
}

/** Wake time is assumed to be the next occurrence of that time-of-day after bedtime — handles the common overnight case (23:00 → 07:00) without the user ever entering a date. */
function computeDurationMinutes(bedtime: string, wakeTime: string): number | null {
  const bedMinutes = parseTimeToMinutes(bedtime);
  const wakeMinutes = parseTimeToMinutes(wakeTime);
  if (bedMinutes === null || wakeMinutes === null) return null;
  return wakeMinutes > bedMinutes ? wakeMinutes - bedMinutes : MINUTES_PER_DAY - bedMinutes + wakeMinutes;
}

/** Sleep's business logic — owns the bedtime/wake-time → duration derivation so neither the UI nor the repository has to know how that math works. */
export const SleepService = {
  async getSleepForDate(db: SQLiteDatabase, date: string): Promise<SleepLog | null> {
    return getSleepLogForDate(db, date);
  },

  async saveSleep(db: SQLiteDatabase, date: string, input: SleepInput): Promise<SleepLog | null> {
    const hasContent = Boolean(input.bedtime) || Boolean(input.wakeTime) || input.quality !== null;
    if (!hasContent) {
      return null;
    }
    const durationMinutes =
      input.bedtime && input.wakeTime ? computeDurationMinutes(input.bedtime, input.wakeTime) : null;
    return upsertSleepLog(db, date, input.bedtime, input.wakeTime, durationMinutes, input.quality);
  },
};
