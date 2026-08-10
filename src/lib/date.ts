/** Fallback only — used server-side when no signed-in user's stored timezone is available yet (pre-onboarding, automation routes with no user context). Every date.ts function accepts an explicit `timeZone` override; this is just what they fall back to when one isn't passed. */
export const APP_TIME_ZONE = "Asia/Kolkata";

/**
 * The best timezone to assume when a caller doesn't pass one explicitly.
 * In the browser this is always correct — `Intl` reports the visitor's
 * real timezone, no lookup needed, which is why every client component
 * that calls these functions with no `timeZone` argument "just works" for
 * whoever's actually looking at the screen. On the server there's no
 * "visitor" to ask, so callers that need a specific signed-in user's
 * timezone (their `profiles.timezone`, via `getCurrentUserTimeZone()` in
 * `@/lib/profile/queries`) must pass it explicitly — this default is only
 * ever a placeholder for that case, not a substitute for it.
 */
function defaultTimeZone(): string {
  if (typeof window !== "undefined") {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return APP_TIME_ZONE;
    }
  }
  return APP_TIME_ZONE;
}

export function getLocalDateString(date: Date = new Date(), timeZone: string = defaultTimeZone()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

/** Current hour (0-23) in `timeZone` — used to decide when "generate tonight's report" should read as urgent rather than just the default empty state. */
export function getLocalHour(date: Date = new Date(), timeZone: string = defaultTimeZone()): number {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hour12: false }).format(date),
  );
}

export function getDaysAgoDateString(
  daysAgo: number,
  from: Date = new Date(),
  timeZone: string = defaultTimeZone(),
): string {
  const shifted = new Date(from);
  shifted.setDate(shifted.getDate() - daysAgo);
  return getLocalDateString(shifted, timeZone);
}

export function formatDateHeading(date: Date = new Date(), timeZone: string = defaultTimeZone()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date = new Date(), timeZone: string = defaultTimeZone()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatWeekdayShort(date: Date = new Date(), timeZone: string = defaultTimeZone()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
}

export function formatShortDateWithWeekday(date: Date = new Date(), timeZone: string = defaultTimeZone()): string {
  return `${formatShortDate(date, timeZone)} (${formatWeekdayShort(date, timeZone)})`;
}

export function addDays(dateStr: string, days: number, timeZone: string = defaultTimeZone()): string {
  return getDaysAgoDateString(-days, new Date(`${dateStr}T00:00:00`), timeZone);
}

/** Monday of the ISO week containing `dateStr`. */
export function getWeekStart(dateStr: string, timeZone: string = defaultTimeZone()): string {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(dateStr, diffToMonday, timeZone);
}

export function formatWeekRangeLabel(start: string, end: string, timeZone: string = defaultTimeZone()): string {
  const startLabel = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(new Date(`${start}T00:00:00`));
  const endLabel = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${end}T00:00:00`));
  return `${startLabel} – ${endLabel}`;
}

export function getCurrentMonthString(date: Date = new Date(), timeZone: string = defaultTimeZone()): string {
  return getLocalDateString(date, timeZone).slice(0, 7);
}

export function shiftMonthString(monthStr: string, delta: number): string {
  const [year, month] = monthStr.split("-").map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

/** First and last calendar day of `monthStr` ("YYYY-MM"), as YYYY-MM-DD strings. */
export function getMonthRange(monthStr: string): { start: string; end: string } {
  const [year, month] = monthStr.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${monthStr}-01`,
    end: `${monthStr}-${String(lastDay).padStart(2, "0")}`,
  };
}

/** Rounds to the nearest whole minute first — callers sometimes pass a fractional average (e.g. avg sleep across several nights), and splitting a float into hours/minutes via `%` without rounding first produces IEEE-754 noise like "17.100000000000023m". */
export function formatDuration(minutes: number): string {
  const rounded = Math.round(minutes);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

export function formatMonthLabel(monthStr: string, timeZone: string = defaultTimeZone()): string {
  const [year, month] = monthStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}
