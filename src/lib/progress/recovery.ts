import { formatDuration } from "@/lib/date";
import type { SleepLog } from "@/lib/sleep/types";
import type { WaterLog } from "@/lib/water/types";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
}

export interface RecoverySummary {
  avgSleepMinutes: number | null;
  avgWaterGlasses: number | null;
  daysWithSleep: number;
  daysWithWater: number;
  hydrationTargetHitDays: number;
}

export function computeRecoverySummary(
  sleepLogs: SleepLog[],
  waterLogs: WaterLog[],
): RecoverySummary {
  return {
    avgSleepMinutes: average(sleepLogs.map((l) => l.duration_minutes)),
    avgWaterGlasses: average(waterLogs.map((l) => l.glass_count)),
    daysWithSleep: sleepLogs.length,
    daysWithWater: waterLogs.length,
    hydrationTargetHitDays: waterLogs.filter((l) => l.glass_count >= l.target_glasses).length,
  };
}

/** One combined sentence for Daily — sleep and hydration told together, never as two separate stats. */
export function buildDailyRecoverySentence(params: {
  sleepMinutes: number | null;
  avgSleepMinutes: number | null;
  waterGlasses: number | null;
  waterTarget: number;
}): string {
  const { sleepMinutes, avgSleepMinutes, waterGlasses, waterTarget } = params;

  if (sleepMinutes === null && waterGlasses === null) {
    return "No sleep or hydration logged today — log them to see how recovery is tracking.";
  }

  const parts: string[] = [];
  let trackedCount = 0;
  let goodCount = 0;

  if (sleepMinutes !== null) {
    trackedCount++;
    if (avgSleepMinutes !== null) {
      const diff = Math.round(sleepMinutes - avgSleepMinutes);
      if (Math.abs(diff) < 15) {
        parts.push(`you slept ${formatDuration(sleepMinutes)}, in line with your recent average`);
        goodCount++;
      } else if (diff > 0) {
        parts.push(
          `you slept ${formatDuration(sleepMinutes)}, ${formatDuration(diff)} above your recent average`,
        );
        goodCount++;
      } else {
        parts.push(
          `you slept ${formatDuration(sleepMinutes)}, ${formatDuration(-diff)} below your recent average`,
        );
      }
    } else {
      parts.push(`you slept ${formatDuration(sleepMinutes)}`);
      if (sleepMinutes >= 7 * 60) goodCount++;
    }
  }

  if (waterGlasses !== null) {
    trackedCount++;
    if (waterGlasses >= waterTarget) {
      parts.push(`hydration hit your ${waterTarget}-glass target`);
      goodCount++;
    } else {
      parts.push(`hydration reached ${waterGlasses} of ${waterTarget} glasses`);
      if (waterGlasses / waterTarget >= 0.75) goodCount++;
    }
  }

  const lead =
    goodCount === trackedCount
      ? "Recovery looked solid today"
      : goodCount === 0
        ? "Recovery was the gap today"
        : "Recovery was mixed today";

  return `${lead} — ${parts.join(", while ")}.`;
}

const MIN_DAYS_FOR_COMPARISON = 2;
const SLEEP_CHANGE_THRESHOLD_MIN = 15;
const WATER_CHANGE_THRESHOLD_GLASSES = 0.75;

/** Deterministic week/month-over-previous-period recovery insights — only emits what's actually worth mentioning. */
export function computeRecoveryInsights(
  current: { sleepLogs: SleepLog[]; waterLogs: WaterLog[] },
  previous: { sleepLogs: SleepLog[]; waterLogs: WaterLog[] },
): string[] {
  const insights: string[] = [];
  const currentSummary = computeRecoverySummary(current.sleepLogs, current.waterLogs);
  const previousSummary = computeRecoverySummary(previous.sleepLogs, previous.waterLogs);

  const canCompareSleep =
    currentSummary.daysWithSleep >= MIN_DAYS_FOR_COMPARISON &&
    previousSummary.daysWithSleep >= MIN_DAYS_FOR_COMPARISON;
  if (
    canCompareSleep &&
    currentSummary.avgSleepMinutes !== null &&
    previousSummary.avgSleepMinutes !== null
  ) {
    const diff = Math.round(currentSummary.avgSleepMinutes - previousSummary.avgSleepMinutes);
    if (Math.abs(diff) >= SLEEP_CHANGE_THRESHOLD_MIN) {
      insights.push(
        diff > 0
          ? `Sleep improved, averaging ${formatDuration(diff)} more per night.`
          : `Sleep fell, averaging ${formatDuration(-diff)} less per night.`,
      );
    }
  }

  const canCompareWater =
    currentSummary.daysWithWater >= MIN_DAYS_FOR_COMPARISON &&
    previousSummary.daysWithWater >= MIN_DAYS_FOR_COMPARISON;
  if (
    canCompareWater &&
    currentSummary.avgWaterGlasses !== null &&
    previousSummary.avgWaterGlasses !== null
  ) {
    const diff =
      Math.round((currentSummary.avgWaterGlasses - previousSummary.avgWaterGlasses) * 10) / 10;
    if (Math.abs(diff) >= WATER_CHANGE_THRESHOLD_GLASSES) {
      insights.push(
        diff > 0
          ? `Hydration improved, up ${diff} glasses/day on average.`
          : `Hydration dropped, down ${Math.abs(diff)} glasses/day on average.`,
      );
    }
  }

  if (insights.length === 0 && currentSummary.daysWithSleep + currentSummary.daysWithWater > 0) {
    insights.push("Sleep and hydration held steady compared to last period.");
  }

  return insights;
}
