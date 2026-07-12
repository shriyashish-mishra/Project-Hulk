"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { getLocalDateString } from "@/lib/date";
import type { Database } from "@/lib/supabase/database.types";
import { calculateProteinTargetG } from "./targets";
import type {
  ActivityLevel,
  BiologicalSex,
  PrimaryGoal,
  TrainingFrequency,
  UnitsPreference,
} from "./types";

const DOB_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_HEIGHT_CM = 100;
const MAX_HEIGHT_CM = 250;
const MIN_WEIGHT_KG = 20;
const MAX_WEIGHT_KG = 400;

export interface CompleteOnboardingInput {
  displayName: string;
  dateOfBirth: string;
  biologicalSex: BiologicalSex;
  heightCm: number;
  weightKg: number;
  primaryGoal: PrimaryGoal;
  targetWeightKg: number | null;
  activityLevel: ActivityLevel;
  trainingFrequency: TrainingFrequency;
  unitsPreference: UnitsPreference;
}

/** Writes the profile row and seeds the FIRST weight_logs entry from the onboarding weight — weight_logs stays the source of truth for trends, the profile never duplicates it. */
export async function completeOnboarding(input: CompleteOnboardingInput): Promise<void> {
  if (!DOB_PATTERN.test(input.dateOfBirth)) {
    throw new Error("Enter a valid date of birth.");
  }
  if (!Number.isFinite(input.heightCm) || input.heightCm < MIN_HEIGHT_CM || input.heightCm > MAX_HEIGHT_CM) {
    throw new Error("Enter a height between 100 and 250 cm.");
  }
  if (!Number.isFinite(input.weightKg) || input.weightKg < MIN_WEIGHT_KG || input.weightKg > MAX_WEIGHT_KG) {
    throw new Error("Enter a weight between 20 and 400 kg.");
  }
  if (
    input.targetWeightKg != null &&
    (!Number.isFinite(input.targetWeightKg) || input.targetWeightKg < MIN_WEIGHT_KG || input.targetWeightKg > MAX_WEIGHT_KG)
  ) {
    throw new Error("Enter a target weight between 20 and 400 kg.");
  }

  const { supabase, user } = await requireUser();
  const roundedWeight = Math.round(input.weightKg * 10) / 10;
  const proteinTargetG = calculateProteinTargetG(roundedWeight, input.primaryGoal);
  const today = getLocalDateString();

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: input.displayName.trim() || null,
    date_of_birth: input.dateOfBirth,
    biological_sex: input.biologicalSex,
    height_cm: input.heightCm,
    primary_goal: input.primaryGoal,
    target_weight_kg: input.targetWeightKg,
    activity_level: input.activityLevel,
    training_frequency: input.trainingFrequency,
    protein_target_g: proteinTargetG,
    units_preference: input.unitsPreference,
    onboarding_completed_at: new Date().toISOString(),
  });
  if (profileError) throw new Error(profileError.message);

  const { error: weightError } = await supabase
    .from("weight_logs")
    .upsert(
      { user_id: user.id, measured_on: today, weight_kg: roundedWeight },
      { onConflict: "user_id,measured_on" },
    );
  if (weightError) throw new Error(weightError.message);

  revalidatePath("/", "layout");
  redirect("/");
}

export interface UpdateProfileFieldsInput {
  displayName?: string;
  dateOfBirth?: string;
  biologicalSex?: BiologicalSex;
  heightCm?: number;
  primaryGoal?: PrimaryGoal;
  targetWeightKg?: number | null;
  activityLevel?: ActivityLevel;
  trainingFrequency?: TrainingFrequency;
  proteinTargetG?: number | null;
  unitsPreference?: UnitsPreference;
}

/** Partial update over one or more profile sections — the Profile page edits by logical group, not one giant form. */
export async function updateProfileFields(input: UpdateProfileFieldsInput): Promise<void> {
  const { supabase, user } = await requireUser();

  const patch: Database["public"]["Tables"]["profiles"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (input.displayName !== undefined) patch.display_name = input.displayName.trim() || null;
  if (input.dateOfBirth !== undefined) patch.date_of_birth = input.dateOfBirth;
  if (input.biologicalSex !== undefined) patch.biological_sex = input.biologicalSex;
  if (input.heightCm !== undefined) patch.height_cm = input.heightCm;
  if (input.primaryGoal !== undefined) patch.primary_goal = input.primaryGoal;
  if (input.targetWeightKg !== undefined) patch.target_weight_kg = input.targetWeightKg;
  if (input.activityLevel !== undefined) patch.activity_level = input.activityLevel;
  if (input.trainingFrequency !== undefined) patch.training_frequency = input.trainingFrequency;
  if (input.proteinTargetG !== undefined) patch.protein_target_g = input.proteinTargetG;
  if (input.unitsPreference !== undefined) patch.units_preference = input.unitsPreference;

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

const DATA_TABLES = [
  "food_logs",
  "workout_logs",
  "daily_ai_reports",
  "water_logs",
  "sleep_logs",
  "weight_logs",
  "progress_photos",
] as const;

/**
 * Wipes every row this user owns plus their photo storage folder, then signs
 * them out. Does NOT delete the auth.users login — that needs a service-role
 * key the app has deliberately never introduced (see plan doc).
 */
export async function deleteMyData(): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: photoFiles } = await supabase.storage.from("progress-photos").list(user.id);
  if (photoFiles && photoFiles.length > 0) {
    await supabase.storage
      .from("progress-photos")
      .remove(photoFiles.map((file) => `${user.id}/${file.name}`));
  }

  for (const table of DATA_TABLES) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) throw new Error(error.message);
  }

  const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id);
  if (profileError) throw new Error(profileError.message);

  await supabase.auth.signOut();
  redirect("/login");
}
