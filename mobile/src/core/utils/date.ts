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
