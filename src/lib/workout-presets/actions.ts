"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { WorkoutPreset } from "./types";

function assertValidText(rawText: string) {
  if (!rawText.trim()) {
    throw new Error("Write something first.");
  }
}

export async function createWorkoutPreset(rawText: string): Promise<WorkoutPreset> {
  assertValidText(rawText);

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_presets")
    .insert({ user_id: user.id, raw_text: rawText.trim() })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  return data;
}

export async function updateWorkoutPreset(
  id: string,
  rawText: string,
): Promise<WorkoutPreset> {
  assertValidText(rawText);

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_presets")
    .update({ raw_text: rawText.trim() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  return data;
}

export async function deleteWorkoutPreset(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("workout_presets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
