/** `workout_sessions.completed_at` is a SQLite `datetime('now')` string ("YYYY-MM-DD HH:MM:SS", UTC, no timezone suffix) — not a plain `YYYY-MM-DD` date, so it needs its own formatter rather than `core/utils`'s date-only helpers. */
function toDate(completedAt: string): Date {
  return new Date(`${completedAt.replace(' ', 'T')}Z`);
}

/** e.g. "Aug 2" — for chart axis labels and history rows. */
export function formatSessionShortDate(completedAt: string): string {
  return toDate(completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** e.g. "Aug 2, 2026" — for a session detail header. */
export function formatSessionFullDate(completedAt: string): string {
  return toDate(completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
