import { calculateAverageCycleLengthDays, estimateCyclePhase, DEFAULT_CYCLE_LENGTH_DAYS } from "@/lib/cycle/math";
import type { CycleEstimate, PeriodRange } from "@/lib/cycle/types";
import { getLocalDateString } from "@/lib/date";
import { getUserContextRpc } from "./rpc";
import {
  CALORIE_RANGE_BUFFER_KCAL,
  calculateAge,
  calculateCalorieRangeKcal,
  calculateFiberTargetG,
  calculateHydrationTargetGlasses,
  calculateMacroTargetsG,
  calculateProteinTargetG,
  calculateSleepTargetMinutes,
} from "./targets";
import type { Profile } from "./types";

export interface UserContext {
  profile: Profile | null;
  age: number | null;
  latestWeightKg: number | null;
  proteinTargetG: number | null;
  calorieRangeKcal: { min: number; max: number } | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
  fiberTargetG: number | null;
  hydrationTargetGlasses: number | null;
  sleepTargetMinutes: number | null;
  cycleEstimate: CycleEstimate | null;
  /** Raw period history — only populated for female profiles, so client components (CycleRow) can recompute the estimate locally after a mutation without a full round-trip. */
  periods: PeriodRange[];
}

const DEFAULT_HYDRATION_TARGET_GLASSES = 8;

/**
 * Single fetch point for "who is this user and what do they need." Reused by
 * Today, the nightly report prompt, Progress, and the Profile page itself —
 * nothing should re-fetch/re-derive profile targets independently. Backed
 * by one cached RPC call (see rpc.ts) rather than several separate queries.
 *
 * `asOfDate` only affects the cycle-phase estimate (so a past-day log page
 * can show what phase the user was in on that date) — the RPC fetch itself
 * is not re-run per date, it's still one cached call per request.
 */
export async function getUserContext(asOfDate: string = getLocalDateString()): Promise<UserContext> {
  const { profile: rawProfile, latest_weight: latestWeightLog, periods: rawPeriods } =
    await getUserContextRpc();
  const profile = rawProfile as Profile | null;

  if (!profile) {
    return {
      profile: null,
      age: null,
      latestWeightKg: null,
      proteinTargetG: null,
      calorieRangeKcal: null,
      carbsTargetG: null,
      fatTargetG: null,
      fiberTargetG: null,
      hydrationTargetGlasses: null,
      sleepTargetMinutes: null,
      cycleEstimate: null,
      periods: [],
    };
  }

  const latestWeightKg = latestWeightLog ? Number(latestWeightLog.weight_kg) : null;
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;

  const proteinTargetG =
    profile.protein_target_g ??
    (latestWeightKg && profile.primary_goal
      ? calculateProteinTargetG(latestWeightKg, profile.primary_goal)
      : null);

  const calorieRangeKcal =
    profile.calorie_target_kcal != null
      ? { min: profile.calorie_target_kcal - CALORIE_RANGE_BUFFER_KCAL, max: profile.calorie_target_kcal + CALORIE_RANGE_BUFFER_KCAL }
      : calculateCalorieRangeKcal({
          dateOfBirth: profile.date_of_birth,
          biologicalSex: profile.biological_sex,
          heightCm: profile.height_cm,
          activityLevel: profile.activity_level,
          primaryGoal: profile.primary_goal,
          latestWeightKg,
        });

  const macroTargetsG = calculateMacroTargetsG(calorieRangeKcal, proteinTargetG, profile.primary_goal);
  const carbsTargetG = profile.carbs_target_g ?? macroTargetsG?.carbsG ?? null;
  const fatTargetG = profile.fat_target_g ?? macroTargetsG?.fatG ?? null;
  const fiberTargetG = profile.fiber_target_g ?? calculateFiberTargetG(calorieRangeKcal);

  const hydrationTargetGlasses =
    profile.hydration_target_glasses ??
    (latestWeightKg
      ? calculateHydrationTargetGlasses({
          weightKg: latestWeightKg,
          biologicalSex: profile.biological_sex,
          age,
          heightCm: profile.height_cm,
        })
      : DEFAULT_HYDRATION_TARGET_GLASSES);

  const sleepTargetMinutes = profile.sleep_target_minutes ?? calculateSleepTargetMinutes(age);

  // Entirely opt-in: only computed for users who've said they're female AND
  // logged at least one period start. No log, no estimate — never inferred.
  const periods: PeriodRange[] =
    profile.biological_sex === "female"
      ? rawPeriods.map((p) => ({ startedOn: p.started_on, endedOn: p.ended_on }))
      : [];

  let cycleEstimate: CycleEstimate | null = null;
  if (periods.length > 0) {
    const cycleLengthDays =
      calculateAverageCycleLengthDays(periods) ??
      profile.average_cycle_length_days ??
      DEFAULT_CYCLE_LENGTH_DAYS;
    cycleEstimate = estimateCyclePhase(periods, cycleLengthDays, asOfDate);
  }

  return {
    profile,
    age,
    latestWeightKg,
    proteinTargetG,
    calorieRangeKcal,
    carbsTargetG,
    fatTargetG,
    fiberTargetG,
    hydrationTargetGlasses,
    sleepTargetMinutes,
    cycleEstimate,
    periods,
  };
}
