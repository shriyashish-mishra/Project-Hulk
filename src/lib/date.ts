export const APP_TIME_ZONE = "Asia/Kolkata";

export function getLocalDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(
    date,
  );
}

export function getDaysAgoDateString(
  daysAgo: number,
  from: Date = new Date(),
): string {
  const shifted = new Date(from);
  shifted.setDate(shifted.getDate() - daysAgo);
  return getLocalDateString(shifted);
}

export function formatDateHeading(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatWeekdayShort(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    weekday: "short",
  }).format(date);
}

export function addDays(dateStr: string, days: number): string {
  return getDaysAgoDateString(-days, new Date(`${dateStr}T00:00:00`));
}

/** Monday of the ISO week containing `dateStr`. */
export function getWeekStart(dateStr: string): string {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return addDays(dateStr, diffToMonday);
}

export function formatWeekRangeLabel(start: string, end: string): string {
  const startLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    month: "short",
    day: "numeric",
  }).format(new Date(`${start}T00:00:00`));
  const endLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${end}T00:00:00`));
  return `${startLabel} – ${endLabel}`;
}

export function getCurrentMonthString(date: Date = new Date()): string {
  return getLocalDateString(date).slice(0, 7);
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

export function formatMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}
