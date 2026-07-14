import type { CycleEstimate, CyclePhase, PeriodRange } from "./types";

/**
 * A coaching heuristic, not a medical or fertility tool — a standard
 * proportional phase model, deterministic and documented so the estimate
 * is always explainable. Ovulation is assumed ~14 days before the next
 * period regardless of overall cycle length (luteal-phase length is
 * relatively fixed across cycle lengths in typical cycles); everything
 * before that is follicular, after a short ovulation window is luteal.
 */
export const DEFAULT_CYCLE_LENGTH_DAYS = 28;
const DEFAULT_PERIOD_LENGTH_DAYS = 5;
const OVULATION_WINDOW_DAYS = 2;
const LUTEAL_PHASE_LENGTH_DAYS = 14;
/** Beyond this many days, an unmarked-ended period is treated as a stale record rather than assumed still ongoing — falls back to the length-based estimate instead. */
const MAX_ASSUMED_OPEN_PERIOD_DAYS = 10;

function daysBetween(fromDate: string, toDate: string): number {
  return Math.round((Date.parse(toDate) - Date.parse(fromDate)) / 86_400_000);
}

export function estimateCyclePhase(
  periodsAscending: PeriodRange[],
  cycleLengthDays: number,
  asOfDate: string,
): CycleEstimate {
  const latest = periodsAscending[periodsAscending.length - 1];
  const daysSinceStart = daysBetween(latest.startedOn, asOfDate);

  // Ground truth over assumption: an open period the user is still inside of
  // (and hasn't gone stale) is menstrual, full stop — no length guess needed.
  if (
    latest.endedOn === null &&
    daysSinceStart >= 0 &&
    daysSinceStart < MAX_ASSUMED_OPEN_PERIOD_DAYS
  ) {
    return {
      cycleDay: daysSinceStart + 1,
      phase: "menstrual",
      cycleLengthDays,
      isOngoing: true,
    };
  }

  const periodLengthDays = calculateAveragePeriodLengthDays(periodsAscending) ?? DEFAULT_PERIOD_LENGTH_DAYS;
  const cycleDay = (((daysSinceStart % cycleLengthDays) + cycleLengthDays) % cycleLengthDays) + 1;

  const ovulationDay = Math.max(1, cycleLengthDays - LUTEAL_PHASE_LENGTH_DAYS);

  let phase: CyclePhase;
  if (cycleDay <= periodLengthDays) {
    phase = "menstrual";
  } else if (cycleDay < ovulationDay) {
    phase = "follicular";
  } else if (cycleDay < ovulationDay + OVULATION_WINDOW_DAYS) {
    phase = "ovulation";
  } else {
    phase = "luteal";
  }

  return { cycleDay, phase, cycleLengthDays, isOngoing: false };
}

/** Real history beats a guess — once 2+ period starts are logged, use the actual average gap instead of the stored/default estimate. */
export function calculateAverageCycleLengthDays(periodsAscending: PeriodRange[]): number | null {
  if (periodsAscending.length < 2) return null;

  const gaps: number[] = [];
  for (let i = 1; i < periodsAscending.length; i++) {
    gaps.push(daysBetween(periodsAscending[i - 1].startedOn, periodsAscending[i].startedOn));
  }
  return Math.round(gaps.reduce((sum, g) => sum + g, 0) / gaps.length);
}

/** Real history beats the fixed 5-day assumption — averages only over periods the user has actually marked as over. */
export function calculateAveragePeriodLengthDays(periodsAscending: PeriodRange[]): number | null {
  const lengths = periodsAscending
    .filter((p): p is PeriodRange & { endedOn: string } => p.endedOn !== null)
    .map((p) => daysBetween(p.startedOn, p.endedOn) + 1);

  if (lengths.length === 0) return null;
  return Math.round(lengths.reduce((sum, l) => sum + l, 0) / lengths.length);
}
