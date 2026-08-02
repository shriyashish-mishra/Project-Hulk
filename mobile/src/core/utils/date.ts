/**
 * Local calendar date as `YYYY-MM-DD`, matching every `date`/`logged_on`/
 * `measured_on` column. Deliberately built from local getters (not
 * `toISOString`, which is UTC) so "today" means the user's actual today
 * regardless of timezone.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Adds (or subtracts, with a negative `days`) whole days to a `YYYY-MM-DD` string, returning the same format. Built from local-date parts, same timezone discipline as `getTodayDateString`. */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Short weekday label, e.g. "Mon" — for compact per-day chart axes. */
export function formatWeekdayShort(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
}
