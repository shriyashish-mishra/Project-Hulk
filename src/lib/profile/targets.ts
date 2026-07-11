import type { ActivityLevel, BiologicalSex, PrimaryGoal } from "./types";
import { ACTIVITY_LEVEL_MULTIPLIER } from "./types";

/**
 * All target calculations live here, deterministic and documented — the AI
 * is never asked to compute a number the app can compute reliably. Every
 * function returns `null` rather than a guess when required inputs are
 * missing; callers must render "not enough info yet," never a fabricated
 * number.
 */

export function calculateAge(dateOfBirth: string, asOf: Date = new Date()): number {
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  let age = asOf.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    asOf.getMonth() > dob.getMonth() ||
    (asOf.getMonth() === dob.getMonth() && asOf.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

const PROTEIN_G_PER_KG: Record<PrimaryGoal, number> = {
  lose_fat: 1.8,
  build_muscle: 2.0,
  recomposition: 1.9,
  maintain: 1.6,
};

/** Bodyweight-based protein target, banded by goal, rounded to the nearest 5g. Distinct from the trailing-average-based weekly nudge in lib/progress/weekly-plan.ts — this is the standing profile target. */
export function calculateProteinTargetG(weightKg: number, goal: PrimaryGoal): number {
  const grams = weightKg * PROTEIN_G_PER_KG[goal];
  return Math.round(grams / 5) * 5;
}

const GOAL_CALORIE_ADJUSTMENT: Record<Exclude<PrimaryGoal, "recomposition">, number> = {
  lose_fat: -0.15,
  build_muscle: 0.1,
  maintain: 0,
};

const CALORIE_RANGE_BUFFER_KCAL = 100;

export interface CalorieRangeInput {
  dateOfBirth: string | null;
  biologicalSex: BiologicalSex | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  primaryGoal: PrimaryGoal | null;
  latestWeightKg: number | null;
}

/**
 * Mifflin-St Jeor BMR × activity multiplier × goal adjustment, ±100kcal
 * range. Returns null if any required input is missing — never invents a
 * number from partial data. Recomposition deliberately returns null: the
 * brief is explicit that recomp shouldn't be reduced to a calorie framing.
 */
export function calculateCalorieRangeKcal(
  input: CalorieRangeInput,
): { min: number; max: number } | null {
  const { dateOfBirth, biologicalSex, heightCm, activityLevel, primaryGoal, latestWeightKg } = input;

  if (
    !dateOfBirth ||
    !biologicalSex ||
    !heightCm ||
    !activityLevel ||
    !primaryGoal ||
    !latestWeightKg ||
    primaryGoal === "recomposition"
  ) {
    return null;
  }

  const age = calculateAge(dateOfBirth);
  const sexOffset = biologicalSex === "male" ? 5 : -161;
  const bmr = 10 * latestWeightKg + 6.25 * heightCm - 5 * age + sexOffset;
  const tdee = bmr * ACTIVITY_LEVEL_MULTIPLIER[activityLevel];
  const adjusted = tdee * (1 + GOAL_CALORIE_ADJUSTMENT[primaryGoal]);

  return {
    min: Math.round((adjusted - CALORIE_RANGE_BUFFER_KCAL) / 10) * 10,
    max: Math.round((adjusted + CALORIE_RANGE_BUFFER_KCAL) / 10) * 10,
  };
}

const ML_PER_KG_BODYWEIGHT = 35;
const GLASS_SIZE_ML = 250;
const MIN_HYDRATION_GLASSES = 6;
const MAX_HYDRATION_GLASSES = 14;

/** Simple bodyweight-based hydration suggestion — water_logs.target_glasses stays per-log editable, this only seeds a smarter default. */
export function calculateHydrationTargetGlasses(weightKg: number): number {
  const glasses = Math.round((weightKg * ML_PER_KG_BODYWEIGHT) / GLASS_SIZE_ML);
  return Math.min(MAX_HYDRATION_GLASSES, Math.max(MIN_HYDRATION_GLASSES, glasses));
}
