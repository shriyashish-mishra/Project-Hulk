import type { Database } from "@/lib/supabase/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type BiologicalSex = "female" | "male";
export type MuscleMapModel = "female" | "male";
export type PrimaryGoal = "lose_fat" | "build_muscle" | "recomposition" | "maintain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type TrainingFrequency = "0_1" | "2_3" | "4_5" | "6_plus";
export type UnitsPreference = "metric" | "imperial";

/** `ProfileRow` with its free-text-checked columns narrowed to their real union types. */
export interface Profile extends Omit<
  ProfileRow,
  "biological_sex" | "primary_goal" | "activity_level" | "training_frequency" | "units_preference"
> {
  biological_sex: BiologicalSex | null;
  primary_goal: PrimaryGoal | null;
  activity_level: ActivityLevel | null;
  training_frequency: TrainingFrequency | null;
  units_preference: UnitsPreference;
}

/** The muscle map always mirrors biological sex — no independent preference, no separate stored column to drift out of sync. Defaults to "female" when sex isn't set yet, matching MuscleMap's existing default. */
export function deriveMuscleMapModel(biologicalSex: BiologicalSex | null): MuscleMapModel {
  return biologicalSex === "male" ? "male" : "female";
}

export const PRIMARY_GOAL_LABEL: Record<PrimaryGoal, string> = {
  lose_fat: "Lose fat",
  build_muscle: "Build muscle",
  recomposition: "Body recomposition",
  maintain: "Maintain",
};

export const ACTIVITY_LEVEL_LABEL: Record<ActivityLevel, string> = {
  sedentary: "Mostly sitting",
  light: "Lightly active",
  moderate: "Moderately active",
  active: "Active",
  very_active: "Very active",
};

export const TRAINING_FREQUENCY_LABEL: Record<TrainingFrequency, string> = {
  "0_1": "0–1 days/week",
  "2_3": "2–3 days/week",
  "4_5": "4–5 days/week",
  "6_plus": "6+ days/week",
};

/** Multiplier applied to BMR — plain-language labels shown in UI, technical detail kept here only. */
export const ACTIVITY_LEVEL_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};
