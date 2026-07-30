const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** A 24-hour "HH:MM" string, e.g. "22:30" or "7:05" — the one format `SleepService` can derive a duration from. */
export function isValidTimeFormat(value: string): boolean {
  return TIME_PATTERN.test(value.trim());
}
