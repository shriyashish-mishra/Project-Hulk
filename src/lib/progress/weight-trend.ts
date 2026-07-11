import type { WeightLog } from "@/lib/weight/types";

/** Postgres `numeric` comes back from PostgREST as a string — always coerce before doing math on it. */
function toKg(log: WeightLog): number {
  return Number(log.weight_kg);
}

export interface WeightTrend {
  hasData: boolean;
  latestKg: number | null;
  latestDate: string | null;
  smoothedKg: number | null;
  changeKg: number | null;
  sentence: string;
}

const SMOOTHING_WINDOW = 5;
const FLAT_THRESHOLD_KG = 0.3;

/**
 * Deliberately conservative: a rolling average rather than the raw latest
 * reading, and language that never celebrates a single drop or flags a
 * single rise — the trend is the story, not any one weigh-in.
 */
export function computeWeightTrend(
  logsAscending: WeightLog[],
  baselineLog: WeightLog | null,
  periodLabel: string,
): WeightTrend {
  if (logsAscending.length === 0) {
    return {
      hasData: false,
      latestKg: null,
      latestDate: null,
      smoothedKg: null,
      changeKg: null,
      sentence: `No weight logged this ${periodLabel}.`,
    };
  }

  const latest = logsAscending[logsAscending.length - 1];
  const latestKg = toKg(latest);

  const smoothWindow = logsAscending.slice(-SMOOTHING_WINDOW).map(toKg);
  const smoothedKg =
    Math.round((smoothWindow.reduce((sum, v) => sum + v, 0) / smoothWindow.length) * 10) / 10;

  const baseline = logsAscending.length > 1 ? logsAscending[0] : baselineLog;

  if (!baseline) {
    return {
      hasData: true,
      latestKg,
      latestDate: latest.measured_on,
      smoothedKg,
      changeKg: null,
      sentence: `Logged at ${latestKg}kg. One entry isn't enough to show a trend yet.`,
    };
  }

  const changeKg = Math.round((latestKg - toKg(baseline)) * 10) / 10;
  let sentence: string;

  if (logsAscending.length === 1) {
    sentence =
      changeKg === 0
        ? `Logged at ${latestKg}kg, unchanged from your last reading.`
        : `Logged at ${latestKg}kg, ${changeKg > 0 ? "up" : "down"} ${Math.abs(changeKg)}kg from your last reading.`;
  } else if (Math.abs(changeKg) < FLAT_THRESHOLD_KG) {
    sentence = `Scale weight is largely unchanged this ${periodLabel} (around ${smoothedKg}kg). Short-term fluctuation is normal — the trend matters more than any single reading.`;
  } else {
    const direction = changeKg < 0 ? "down" : "up";
    sentence = `Scale weight trended ${direction} ${Math.abs(changeKg)}kg this ${periodLabel}, now averaging around ${smoothedKg}kg.`;
  }

  return { hasData: true, latestKg, latestDate: latest.measured_on, smoothedKg, changeKg, sentence };
}
