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
