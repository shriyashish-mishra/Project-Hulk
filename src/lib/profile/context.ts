import { getLatestWeightLog } from "@/lib/weight/queries";
import { getProfile } from "./queries";
import {
  calculateAge,
  calculateCalorieRangeKcal,
  calculateHydrationTargetGlasses,
  calculateProteinTargetG,
} from "./targets";
import type { Profile } from "./types";

export interface UserContext {
  profile: Profile | null;
  age: number | null;
  latestWeightKg: number | null;
  proteinTargetG: number | null;
  calorieRangeKcal: { min: number; max: number } | null;
  hydrationTargetGlasses: number | null;
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
    ? calculateHydrationTargetGlasses(latestWeightKg)
    : DEFAULT_HYDRATION_TARGET_GLASSES;

  return { profile, age, latestWeightKg, proteinTargetG, calorieRangeKcal, hydrationTargetGlasses };
}
