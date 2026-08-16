import type { ActivityLevel, BiologicalSex, PrimaryGoal } from "./types";
import { ACTIVITY_LEVEL_MULTIPLIER } from "./types";

const SEDENTARY_MULTIPLIER = ACTIVITY_LEVEL_MULTIPLIER.sedentary;

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

export const CALORIE_RANGE_BUFFER_KCAL = 100;

export interface CalorieRangeInput {
  dateOfBirth: string | null;
  biologicalSex: BiologicalSex | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  primaryGoal: PrimaryGoal | null;
  latestWeightKg: number | null;
}

export interface BmrInput {
  dateOfBirth: string | null;
  biologicalSex: BiologicalSex | null;
  heightCm: number | null;
  latestWeightKg: number | null;
}

/**
 * Mifflin-St Jeor basal metabolic rate — resting energy expenditure only,
 * before any activity multiplier or goal adjustment. Deliberately NOT
 * gated on primaryGoal the way calculateCalorieRangeKcal below is: BMR is
 * a physiological constant, not a prescribed target, so it's fine to
 * compute (and hand the AI as a reference for estimating today's deficit)
 * even for a recomposition goal — that goal only ever meant "don't
 * prescribe a calorie target," never "don't compute a baseline." Returns
 * null if any required input is missing.
 */
export function calculateBMR(input: BmrInput): number | null {
  const { dateOfBirth, biologicalSex, heightCm, latestWeightKg } = input;
  if (!dateOfBirth || !biologicalSex || !heightCm || !latestWeightKg) return null;
  const age = calculateAge(dateOfBirth);
  const sexOffset = biologicalSex === "male" ? 5 : -161;
  return Math.round(10 * latestWeightKg + 6.25 * heightCm - 5 * age + sexOffset);
}

/**
 * BMR scaled by the flat "sedentary" multiplier (1.2 — "little or no
 * exercise," see ACTIVITY_LEVEL_MULTIPLIER) rather than the user's own
 * activity_level. This is the deficit baseline in nightly-report/parse.ts,
 * added on top of that day's *specifically logged* workout_calories_burned
 * (steps + exercises). Deliberately NOT the user's real activity_level:
 * "active"/"very_active" already bake in an assumed weekly exercise
 * pattern (see that map's own comments), which is exactly what
 * workout_calories_burned already measures — more accurately, from the
 * actual log — for this specific day. Using both would double-count
 * exercise twice: once via the multiplier's baked-in assumption, once via
 * the logged total. The flat sedentary multiplier instead represents only
 * what raw BMR misses on any day, trained or not: TEF from digesting food,
 * incidental movement, posture, fidgeting — living your day, not lying in
 * bed. Returns null when bmr is null, same null-propagation as every other
 * function here.
 */
export function calculateRestingExpenditureKcal(bmr: number | null): number | null {
  if (bmr === null) return null;
  return Math.round(bmr * SEDENTARY_MULTIPLIER);
}

/**
 * BMR × activity multiplier × goal adjustment, ±100kcal range. Returns
 * null if any required input is missing — never invents a number from
 * partial data. Recomposition deliberately returns null: the brief is
 * explicit that recomp shouldn't be reduced to a calorie framing.
 */
export function calculateCalorieRangeKcal(
  input: CalorieRangeInput,
): { min: number; max: number } | null {
  const { dateOfBirth, biologicalSex, heightCm, activityLevel, primaryGoal, latestWeightKg } = input;

  if (!activityLevel || !primaryGoal || primaryGoal === "recomposition") {
    return null;
  }

  const bmr = calculateBMR({ dateOfBirth, biologicalSex, heightCm, latestWeightKg });
  if (bmr === null) return null;

  const tdee = bmr * ACTIVITY_LEVEL_MULTIPLIER[activityLevel];
  const adjusted = tdee * (1 + GOAL_CALORIE_ADJUSTMENT[primaryGoal]);

  return {
    min: Math.round((adjusted - CALORIE_RANGE_BUFFER_KCAL) / 10) * 10,
    max: Math.round((adjusted + CALORIE_RANGE_BUFFER_KCAL) / 10) * 10,
  };
}

export const FAT_PERCENT_OF_CALORIES: Record<PrimaryGoal, number> = {
  // Fat as a share of total calories; carbs fill whatever's left after
  // protein (grams-based, from calculateProteinTargetG) and fat are
  // allocated. Lower fat for build_muscle leaves more room for carbs to
  // fuel training; slightly higher fat for lose_fat helps satiety in a
  // deficit. Same goal-banding philosophy as PROTEIN_G_PER_KG above.
  lose_fat: 0.3,
  build_muscle: 0.25,
  recomposition: 0.28,
  maintain: 0.28,
};

/**
 * Carb/fat targets in grams, derived from the calorie range's midpoint and
 * the already-computed protein target — never independently guessed.
 * Returns null whenever `calculateCalorieRangeKcal` would (missing
 * inputs, or a recomposition goal, which is deliberately never reduced to
 * a calorie framing) so callers get one consistent "not enough info yet"
 * signal across calories, protein, carbs, and fat.
 */
export function calculateMacroTargetsG(
  calorieRangeKcal: { min: number; max: number } | null,
  proteinTargetG: number | null,
  goal: PrimaryGoal | null,
): { carbsG: number; fatG: number } | null {
  if (!calorieRangeKcal || proteinTargetG === null || !goal) return null;

  const calorieTargetKcal = (calorieRangeKcal.min + calorieRangeKcal.max) / 2;
  const fatKcal = calorieTargetKcal * FAT_PERCENT_OF_CALORIES[goal];
  const proteinKcal = proteinTargetG * 4;
  const remainingKcal = Math.max(0, calorieTargetKcal - proteinKcal - fatKcal);

  return {
    fatG: Math.round(fatKcal / 9 / 5) * 5,
    carbsG: Math.round(remainingKcal / 4 / 5) * 5,
  };
}

export const FIBER_G_PER_1000_KCAL = 14; // Dietary Guidelines for Americans / IOM guideline

/** Same null-propagation as `calculateMacroTargetsG` — fiber is calorie-derived, so it's only ever meaningful when a calorie range exists. */
export function calculateFiberTargetG(calorieRangeKcal: { min: number; max: number } | null): number | null {
  if (!calorieRangeKcal) return null;
  const calorieTargetKcal = (calorieRangeKcal.min + calorieRangeKcal.max) / 2;
  return Math.round(((calorieTargetKcal / 1000) * FIBER_G_PER_1000_KCAL) / 5) * 5;
}

const STRIDE_LENGTH_RATIO = 0.414; // commonly cited height-to-stride-length ratio for walking
const WALKING_KCAL_PER_KG_PER_KM = 0.6; // standard approximation for casual/moderate-pace walking

/**
 * A deterministic reference figure the nightly-report prompt hands to the
 * AI, rather than leaving "how many calories did N steps burn" to be
 * invented from scratch — the same free-text-step-count entries ("16k
 * steps non-workout") that need this were previously estimated by the AI
 * alone, and came back 2-4x too low against this same formula, because a
 * smaller model doing unit-scaled physiology arithmetic from nothing is
 * exactly the kind of thing this codebase already doesn't trust an LLM
 * with (see the calorie/hydration/protein targets above). The AI still
 * has to read the actual step count out of the log — that part stays its
 * job — but the per-1,000-steps rate itself is computed here. Returns
 * null when weight or height aren't known yet, never a guess from
 * partial data.
 */
export function calculateKcalPer1000Steps(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm) return null;
  const strideLengthM = (heightCm * STRIDE_LENGTH_RATIO) / 100;
  const kmPer1000Steps = (1000 * strideLengthM) / 1000;
  return Math.round(kmPer1000Steps * weightKg * WALKING_KCAL_PER_KG_PER_KM);
}

/**
 * Calorie cost of a directly-entered non-workout step count — steps is now
 * structured input (see workout_logs.non_workout_steps), not text the AI
 * has to notice and itemize itself. Reuses the same per-1,000-steps rate
 * as above, applied here deterministically instead of being handed to the
 * AI as an instruction to follow: removes the model from this number's
 * existence entirely, so it can't be dropped by an inattentive parse of
 * the log (see 7222e15) or estimated from nothing. Returns null (never 0)
 * when steps is unset/zero or weight/height aren't known, so callers can
 * tell "no steps logged" apart from "logged, computed to 0."
 */
export function calculateStepsCaloriesBurned(
  steps: number | null,
  weightKg: number | null,
  heightCm: number | null,
): number | null {
  if (!steps || steps <= 0) return null;
  const kcalPer1000Steps = calculateKcalPer1000Steps(weightKg, heightCm);
  if (kcalPer1000Steps === null) return null;
  return Math.round((steps / 1000) * kcalPer1000Steps);
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
export const GLASS_SIZE_ML = 250;
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

/* ---------------------------------------------------------------------- */
/* Suggested defaults for the Targets editor                              */
/* ---------------------------------------------------------------------- */

/**
 * Every suggestion below is shown ONLY inside the Targets editor, as a
 * starting point for a value the user is about to override — distinct
 * from the ambient auto-computed value used everywhere else in the app
 * (getUserContext), which stays current-weight-based. These prefer the
 * user's target weight ("the body you're aiming for") over their current
 * weight, per an explicit product choice: a target is a goal-state
 * number, not a restatement of today. Falls back to current weight when
 * no goal weight is set yet (e.g. a "maintain" goal), and to null when
 * neither exists — callers must render "not enough info yet," never a
 * fabricated number.
 */
export interface TargetSuggestion {
  value: number;
  insight: string;
}

function resolveSuggestionWeightKg(
  targetWeightKg: number | null,
  currentWeightKg: number | null,
): { weightKg: number; basisLabel: string } | null {
  if (targetWeightKg) return { weightKg: targetWeightKg, basisLabel: `target weight of ${targetWeightKg}kg` };
  if (currentWeightKg) return { weightKg: currentWeightKg, basisLabel: `current weight of ${currentWeightKg}kg` };
  return null;
}

export function suggestProteinTargetG(
  targetWeightKg: number | null,
  currentWeightKg: number | null,
  goal: PrimaryGoal | null,
): TargetSuggestion | null {
  const basis = resolveSuggestionWeightKg(targetWeightKg, currentWeightKg);
  if (!basis || !goal) return null;
  const value = calculateProteinTargetG(basis.weightKg, goal);
  return { value, insight: `${value}g — ${PROTEIN_G_PER_KG[goal]}g of protein per kg of your ${basis.basisLabel}.` };
}

export interface CalorieSuggestionInput {
  targetWeightKg: number | null;
  currentWeightKg: number | null;
  dateOfBirth: string | null;
  biologicalSex: BiologicalSex | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  primaryGoal: PrimaryGoal | null;
}

export function suggestCalorieTargetKcal(input: CalorieSuggestionInput): TargetSuggestion | null {
  const basis = resolveSuggestionWeightKg(input.targetWeightKg, input.currentWeightKg);
  if (!basis) return null;
  const range = calculateCalorieRangeKcal({
    dateOfBirth: input.dateOfBirth,
    biologicalSex: input.biologicalSex,
    heightCm: input.heightCm,
    activityLevel: input.activityLevel,
    primaryGoal: input.primaryGoal,
    latestWeightKg: basis.weightKg,
  });
  if (!range) return null;
  const value = Math.round((range.min + range.max) / 2 / 10) * 10;
  return {
    value,
    insight: `${value} kcal/day — Mifflin-St Jeor estimate from your ${basis.basisLabel}, height, age, and activity level.`,
  };
}

export interface MacroSuggestionInput {
  calorieTargetKcal: number | null;
  proteinTargetG: number | null;
  primaryGoal: PrimaryGoal | null;
}

/** Carbs and fat are calorie- and protein-derived, not independently weight-based — so unlike protein/calories/hydration above, these chain from the OTHER suggested values rather than target weight directly. */
export function suggestCarbsAndFatTargetsG(
  input: MacroSuggestionInput,
): { carbs: TargetSuggestion; fat: TargetSuggestion } | null {
  if (input.calorieTargetKcal === null) return null;
  const range = {
    min: input.calorieTargetKcal - CALORIE_RANGE_BUFFER_KCAL,
    max: input.calorieTargetKcal + CALORIE_RANGE_BUFFER_KCAL,
  };
  const macros = calculateMacroTargetsG(range, input.proteinTargetG, input.primaryGoal);
  if (!macros) return null;
  const fatPercent = Math.round(FAT_PERCENT_OF_CALORIES[input.primaryGoal ?? "maintain"] * 100);
  return {
    carbs: {
      value: macros.carbsG,
      insight: `${macros.carbsG}g — whatever's left of your ${input.calorieTargetKcal} kcal/day target after protein and fat.`,
    },
    fat: {
      value: macros.fatG,
      insight: `${macros.fatG}g — ${fatPercent}% of your ${input.calorieTargetKcal} kcal/day target.`,
    },
  };
}

export function suggestFiberTargetG(calorieTargetKcal: number | null): TargetSuggestion | null {
  if (calorieTargetKcal === null) return null;
  const range = { min: calorieTargetKcal - CALORIE_RANGE_BUFFER_KCAL, max: calorieTargetKcal + CALORIE_RANGE_BUFFER_KCAL };
  const value = calculateFiberTargetG(range);
  if (value === null) return null;
  return { value, insight: `${value}g — ${FIBER_G_PER_1000_KCAL}g per 1,000 kcal of your ${calorieTargetKcal} kcal/day target.` };
}

export interface HydrationSuggestionInput {
  targetWeightKg: number | null;
  currentWeightKg: number | null;
  biologicalSex: BiologicalSex | null;
  age: number | null;
  heightCm: number | null;
}

export function suggestHydrationTargetGlasses(input: HydrationSuggestionInput): TargetSuggestion | null {
  const basis = resolveSuggestionWeightKg(input.targetWeightKg, input.currentWeightKg);
  if (!basis) return null;
  const value = calculateHydrationTargetGlasses({
    weightKg: basis.weightKg,
    biologicalSex: input.biologicalSex,
    age: input.age,
    heightCm: input.heightCm,
  });
  return { value, insight: `${value} glasses (~${value * GLASS_SIZE_ML}ml) — based on your ${basis.basisLabel}.` };
}

/** Unlike the others above, never returns null — sleep guidelines are age-banded only (see calculateSleepTargetMinutes), so there's always a value even with zero other profile data. */
export function suggestSleepTargetMinutes(age: number | null): TargetSuggestion {
  const value = calculateSleepTargetMinutes(age);
  const hours = Math.round((value / 60) * 10) / 10;
  return {
    value,
    insight:
      age !== null
        ? `${hours}h — the National Sleep Foundation's guideline for your age (${age}). Sleep needs are age-based, not weight-based.`
        : `${hours}h — general adult guideline. Add your date of birth for an age-specific recommendation.`,
  };
}

export interface AllTargetSuggestions {
  protein: TargetSuggestion | null;
  calories: TargetSuggestion | null;
  carbs: TargetSuggestion | null;
  fat: TargetSuggestion | null;
  fiber: TargetSuggestion | null;
  hydration: TargetSuggestion | null;
  sleep: TargetSuggestion;
}

export interface AllTargetSuggestionsInput {
  targetWeightKg: number | null;
  currentWeightKg: number | null;
  dateOfBirth: string | null;
  biologicalSex: BiologicalSex | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  primaryGoal: PrimaryGoal | null;
  age: number | null;
}

/** One consistent "if I were eating for my goal weight" suggestion set — carbs/fat/fiber chain from the suggested calorie+protein values computed here, not from whatever's currently active (which may itself be a manual override), so every field's default agrees with every other field's. */
export function calculateAllTargetSuggestions(input: AllTargetSuggestionsInput): AllTargetSuggestions {
  const protein = suggestProteinTargetG(input.targetWeightKg, input.currentWeightKg, input.primaryGoal);
  const calories = suggestCalorieTargetKcal({
    targetWeightKg: input.targetWeightKg,
    currentWeightKg: input.currentWeightKg,
    dateOfBirth: input.dateOfBirth,
    biologicalSex: input.biologicalSex,
    heightCm: input.heightCm,
    activityLevel: input.activityLevel,
    primaryGoal: input.primaryGoal,
  });
  const macros = suggestCarbsAndFatTargetsG({
    calorieTargetKcal: calories?.value ?? null,
    proteinTargetG: protein?.value ?? null,
    primaryGoal: input.primaryGoal,
  });
  const fiber = suggestFiberTargetG(calories?.value ?? null);
  const hydration = suggestHydrationTargetGlasses({
    targetWeightKg: input.targetWeightKg,
    currentWeightKg: input.currentWeightKg,
    biologicalSex: input.biologicalSex,
    age: input.age,
    heightCm: input.heightCm,
  });
  const sleep = suggestSleepTargetMinutes(input.age);

  return {
    protein,
    calories,
    carbs: macros?.carbs ?? null,
    fat: macros?.fat ?? null,
    fiber,
    hydration,
    sleep,
  };
}
