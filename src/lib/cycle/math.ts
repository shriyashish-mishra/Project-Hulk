import type { CycleEstimate, CyclePhase } from "./types";

/**
 * A coaching heuristic, not a medical or fertility tool — a standard
 * proportional phase model, deterministic and documented so the estimate
 * is always explainable. Ovulation is assumed ~14 days before the next
 * period regardless of overall cycle length (luteal-phase length is
 * relatively fixed across cycle lengths in typical cycles); everything
 * before that is follicular, after a short ovulation window is luteal.
 */
export const DEFAULT_CYCLE_LENGTH_DAYS = 28;
const PERIOD_LENGTH_DAYS = 5;
const OVULATION_WINDOW_DAYS = 2;
const LUTEAL_PHASE_LENGTH_DAYS = 14;

export function estimateCyclePhase(
  lastPeriodStart: string,
  cycleLengthDays: number,
  asOfDate: string,
): CycleEstimate {
  const daysSinceStart = Math.round(
    (Date.parse(asOfDate) - Date.parse(lastPeriodStart)) / 86_400_000,
  );
  const cycleDay = (((daysSinceStart % cycleLengthDays) + cycleLengthDays) % cycleLengthDays) + 1;

  const ovulationDay = Math.max(1, cycleLengthDays - LUTEAL_PHASE_LENGTH_DAYS);

  let phase: CyclePhase;
  if (cycleDay <= PERIOD_LENGTH_DAYS) {
    phase = "menstrual";
  } else if (cycleDay < ovulationDay) {
    phase = "follicular";
  } else if (cycleDay < ovulationDay + OVULATION_WINDOW_DAYS) {
    phase = "ovulation";
  } else {
    phase = "luteal";
  }

  return { cycleDay, phase, cycleLengthDays };
}

/** Real history beats a guess — once 2+ periods are logged, use the actual average gap instead of the stored/default estimate. */
export function calculateAverageCycleLengthDays(periodStartDatesAscending: string[]): number | null {
  if (periodStartDatesAscending.length < 2) return null;

  const gaps: number[] = [];
  for (let i = 1; i < periodStartDatesAscending.length; i++) {
    gaps.push(
      Math.round(
        (Date.parse(periodStartDatesAscending[i]) - Date.parse(periodStartDatesAscending[i - 1])) /
          86_400_000,
      ),
    );
  }
  return Math.round(gaps.reduce((sum, g) => sum + g, 0) / gaps.length);
}
