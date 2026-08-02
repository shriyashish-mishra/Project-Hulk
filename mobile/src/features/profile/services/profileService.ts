import type { SQLiteDatabase } from 'expo-sqlite';

import { WeightService } from '@/features/weight/services';
import { getProfile, updateProfile } from '../repository';
import type { Profile, ProfileUpdate } from '../types';
import {
  calculateAge,
  calculateCalorieRangeKcal,
  calculateFiberTargetG,
  calculateHydrationTargetGlasses,
  calculateMacroTargetsG,
  calculateProteinTargetG,
  calculateSleepTargetMinutes,
} from '../utils/targets';

const DEFAULT_HYDRATION_TARGET_GLASSES = 8;

/** Same shape as the web app's `UserContext` — the AI prompt builder and the Progress tab both read this bundle rather than recomputing targets independently. */
export interface ProfileTargets {
  profile: Profile | null;
  age: number | null;
  latestWeightKg: number | null;
  proteinTargetG: number | null;
  calorieRangeKcal: { min: number; max: number } | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
  fiberTargetG: number | null;
  hydrationTargetGlasses: number;
  sleepTargetMinutes: number;
}

export const ProfileService = {
  async getProfile(db: SQLiteDatabase): Promise<Profile | null> {
    return getProfile(db);
  },

  async updateProfile(db: SQLiteDatabase, updates: ProfileUpdate): Promise<Profile> {
    return updateProfile(db, updates);
  },

  /** Bundles every derived target in one place — nothing else in the app should recompute these independently. Returns `null` for any target whose required inputs aren't filled in yet, never a guessed number. */
  async getTargets(db: SQLiteDatabase): Promise<ProfileTargets> {
    const [profile, latestWeight] = await Promise.all([getProfile(db), WeightService.getLatest(db)]);
    const latestWeightKg = latestWeight?.weightKg ?? null;
    const age = profile?.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;

    const proteinTargetG =
      profile?.proteinTargetG ??
      (latestWeightKg && profile?.primaryGoal ? calculateProteinTargetG(latestWeightKg, profile.primaryGoal) : null);

    const calorieRangeKcal = calculateCalorieRangeKcal({
      dateOfBirth: profile?.dateOfBirth ?? null,
      biologicalSex: profile?.biologicalSex ?? null,
      heightCm: profile?.heightCm ?? null,
      activityLevel: profile?.activityLevel ?? null,
      primaryGoal: profile?.primaryGoal ?? null,
      latestWeightKg,
    });

    const macroTargetsG = calculateMacroTargetsG(calorieRangeKcal, proteinTargetG, profile?.primaryGoal ?? null);
    const fiberTargetG = calculateFiberTargetG(calorieRangeKcal);

    const hydrationTargetGlasses = latestWeightKg
      ? calculateHydrationTargetGlasses({
          weightKg: latestWeightKg,
          biologicalSex: profile?.biologicalSex ?? null,
          age,
          heightCm: profile?.heightCm ?? null,
        })
      : DEFAULT_HYDRATION_TARGET_GLASSES;

    const sleepTargetMinutes = calculateSleepTargetMinutes(age);

    return {
      profile,
      age,
      latestWeightKg,
      proteinTargetG,
      calorieRangeKcal,
      carbsTargetG: macroTargetsG?.carbsG ?? null,
      fatTargetG: macroTargetsG?.fatG ?? null,
      fiberTargetG,
      hydrationTargetGlasses,
      sleepTargetMinutes,
    };
  },
};
