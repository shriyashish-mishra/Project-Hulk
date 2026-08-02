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

/** e.g. "Aug 2" — a compact date label without a year, for headers where the current year is implied. */
export function formatShortDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** e.g. "Aug 2 (Sun)" — for backfill headers where both the date and the weekday matter. */
export function formatShortDateWithWeekday(dateStr: string): string {
  return `${formatShortDate(dateStr)} (${formatWeekdayShort(dateStr)})`;
}

/** e.g. "August 2026" — for a month-view header. */
export function formatMonthLabel(monthStr: string): string {
  return new Date(`${monthStr}-01T00:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** The first day of the month a given date falls in, as `YYYY-MM-DD`. */
export function getMonthStart(dateStr: string): string {
  return `${dateStr.slice(0, 7)}-01`;
}

/** Shifts a `YYYY-MM` month string by `delta` months (negative to go back), returning the same `YYYY-MM` format. */
export function shiftMonth(monthStr: string, delta: number): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Monday of the week a given date falls in, as `YYYY-MM-DD` — weeks run Monday-Sunday throughout this app, matching the web app's convention. */
export function getWeekStart(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(dateStr, diffToMonday);
}

/** e.g. "Aug 3 – Aug 9" — a week's date range label. */
export function formatWeekRangeLabel(weekStart: string): string {
  return `${formatShortDate(weekStart)} – ${formatShortDate(addDays(weekStart, 6))}`;
}
