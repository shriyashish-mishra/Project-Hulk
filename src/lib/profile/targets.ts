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

const ML_PER_KG_BY_SEX: Record<BiologicalSex, number> = {
  // Commonly cited sports-nutrition range is 30-35ml/kg; split by the
  // typical difference in body-water percentage between sexes rather than
  // using one flat number for everyone.
  male: 35,
  female: 31,
};
const DEFAULT_ML_PER_KG = 33;
const REFERENCE_HEIGHT_CM = 170;
const HEIGHT_ADJUSTMENT_PER_10CM = 0.01;
const MAX_HEIGHT_ADJUSTMENT = 0.05;
const OLDER_ADULT_AGE = 65;
const OLDER_ADULT_ADJUSTMENT = -0.05;
const GLASS_SIZE_ML = 250;
const MIN_HYDRATION_GLASSES = 6;
const MAX_HYDRATION_GLASSES = 14;

export interface HydrationTargetInput {
  weightKg: number;
  biologicalSex: BiologicalSex | null;
  age: number | null;
  heightCm: number | null;
}

/**
 * Bodyweight is the dominant factor (ml/kg, split by sex). Height and age
 * are deliberately small secondary adjustments, not independent factors —
 * there's no credible formula where a 20-year-old and a 70-year-old at the
 * same weight need meaningfully different water intake, so age only trims
 * the total modestly for older adults (lower total body-water %), and
 * height only nudges for surface-area differences at a given weight.
 * Never asked of the user directly — always derived.
 */
export function calculateHydrationTargetGlasses(input: HydrationTargetInput): number {
  const { weightKg, biologicalSex, age, heightCm } = input;
  const mlPerKg = biologicalSex ? ML_PER_KG_BY_SEX[biologicalSex] : DEFAULT_ML_PER_KG;
  const base = weightKg * mlPerKg;

  const heightAdjustment = heightCm
    ? Math.max(
        -MAX_HEIGHT_ADJUSTMENT,
        Math.min(MAX_HEIGHT_ADJUSTMENT, ((heightCm - REFERENCE_HEIGHT_CM) / 10) * HEIGHT_ADJUSTMENT_PER_10CM),
      )
    : 0;
  const ageAdjustment = age !== null && age >= OLDER_ADULT_AGE ? OLDER_ADULT_ADJUSTMENT : 0;

  const adjustedMl = base * (1 + heightAdjustment + ageAdjustment);
  const glasses = Math.round(adjustedMl / GLASS_SIZE_ML);
  return Math.min(MAX_HYDRATION_GLASSES, Math.max(MIN_HYDRATION_GLASSES, glasses));
}

const SLEEP_TARGET_MINUTES_DEFAULT = 480; // 8h — adults 18-64, National Sleep Foundation range 7-9h
const SLEEP_TARGET_MINUTES_TEEN = 540; // 9h — under 18, NSF range 8-10h
const SLEEP_TARGET_MINUTES_OLDER_ADULT = 450; // 7.5h — 65+, NSF range 7-8h
const OLDER_ADULT_SLEEP_AGE = 65;
const TEEN_MAX_AGE = 17;

/**
 * Sleep-duration guidelines (National Sleep Foundation) are banded by age
 * only — there is no credible evidence that weight, height, or sex changes
 * how much sleep an adult needs, unlike hydration. Deliberately NOT
 * extended with those factors to avoid fabricating precision the science
 * doesn't support. Never asked of the user directly — always derived.
 */
export function calculateSleepTargetMinutes(age: number | null): number {
  if (age === null) return SLEEP_TARGET_MINUTES_DEFAULT;
  if (age <= TEEN_MAX_AGE) return SLEEP_TARGET_MINUTES_TEEN;
  if (age >= OLDER_ADULT_SLEEP_AGE) return SLEEP_TARGET_MINUTES_OLDER_ADULT;
  return SLEEP_TARGET_MINUTES_DEFAULT;
}
