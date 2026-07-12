import { getLatestWeightLog } from "@/lib/weight/queries";
import { getAllPeriodLogsAscending, getLatestPeriodLog } from "@/lib/cycle/queries";
import { calculateAverageCycleLengthDays, estimateCyclePhase, DEFAULT_CYCLE_LENGTH_DAYS } from "@/lib/cycle/math";
import type { CycleEstimate } from "@/lib/cycle/types";
import { getLocalDateString } from "@/lib/date";
import { getProfile } from "./queries";
import {
  calculateAge,
  calculateCalorieRangeKcal,
  calculateHydrationTargetGlasses,
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
  hydrationTargetGlasses: number | null;
  sleepTargetMinutes: number | null;
  cycleEstimate: CycleEstimate | null;
}

const DEFAULT_HYDRATION_TARGET_GLASSES = 8;

/**
 * Single fetch point for "who is this user and what do they need." Reused by
 * Today, the nightly report prompt, Progress, and the Profile page itself —
 * nothing should re-fetch/re-derive profile targets independently.
 */
export async function getUserContext(): Promise<UserContext> {
  const [profile, latestWeightLog] = await Promise.all([getProfile(), getLatestWeightLog()]);

  if (!profile) {
    return {
      profile: null,
      age: null,
      latestWeightKg: null,
      proteinTargetG: null,
      calorieRangeKcal: null,
      hydrationTargetGlasses: null,
      sleepTargetMinutes: null,
      cycleEstimate: null,
    };
  }

  const latestWeightKg = latestWeightLog ? Number(latestWeightLog.weight_kg) : null;
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;

  const proteinTargetG =
    profile.protein_target_g ??
    (latestWeightKg && profile.primary_goal
      ? calculateProteinTargetG(latestWeightKg, profile.primary_goal)
      : null);

  const calorieRangeKcal = calculateCalorieRangeKcal({
    dateOfBirth: profile.date_of_birth,
    biologicalSex: profile.biological_sex,
    heightCm: profile.height_cm,
    activityLevel: profile.activity_level,
    primaryGoal: profile.primary_goal,
    latestWeightKg,
  });

  const hydrationTargetGlasses = latestWeightKg
    ? calculateHydrationTargetGlasses({
        weightKg: latestWeightKg,
        biologicalSex: profile.biological_sex,
        age,
        heightCm: profile.height_cm,
      })
    : DEFAULT_HYDRATION_TARGET_GLASSES;

  const sleepTargetMinutes = calculateSleepTargetMinutes(age);

  // Entirely opt-in: only computed for users who've said they're female AND
  // logged at least one period start. No log, no estimate — never inferred.
  let cycleEstimate: CycleEstimate | null = null;
  if (profile.biological_sex === "female") {
    const [latestPeriodLog, allPeriodLogs] = await Promise.all([
      getLatestPeriodLog(),
      getAllPeriodLogsAscending(),
    ]);
    if (latestPeriodLog) {
      const cycleLengthDays =
        calculateAverageCycleLengthDays(allPeriodLogs.map((p) => p.started_on)) ??
        profile.average_cycle_length_days ??
        DEFAULT_CYCLE_LENGTH_DAYS;
      cycleEstimate = estimateCyclePhase(latestPeriodLog.started_on, cycleLengthDays, getLocalDateString());
    }
  }

  return {
    profile,
    age,
    latestWeightKg,
    proteinTargetG,
    calorieRangeKcal,
    hydrationTargetGlasses,
    sleepTargetMinutes,
    cycleEstimate,
  };
}
