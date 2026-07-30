export type SleepQuality = 'poor' | 'fair' | 'good' | 'great';

export const SLEEP_QUALITIES: SleepQuality[] = ['poor', 'fair', 'good', 'great'];

export const SLEEP_QUALITY_LABELS: Record<SleepQuality, string> = {
  poor: 'Poor',
  fair: 'Fair',
  good: 'Good',
  great: 'Great',
};

/**
 * One entry per night. `bedtime`/`wakeTime` are "HH:MM" time-of-day
 * strings, not full timestamps — this is manual entry, not a device
 * integration, so there's no real date attached to either edge, just the
 * night (`loggedOn`) they belong to.
 */
export interface SleepLog {
  id: number;
  loggedOn: string;
  bedtime: string | null;
  wakeTime: string | null;
  durationMinutes: number | null;
  quality: SleepQuality | null;
  createdAt: string;
}
