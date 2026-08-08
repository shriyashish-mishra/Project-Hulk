"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { findExerciseByName } from "./queries";
import type { ExerciseCategory, ExerciseLibraryItem, WeightUnit } from "./types";

/** Finds an existing exercise by name (case-insensitive) or creates one — the catalog grows as you type, same principle as the app's workout presets. */
export async function findOrCreateExercise(
  name: string,
  category: ExerciseCategory,
  defaultUnit: WeightUnit,
): Promise<ExerciseLibraryItem> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name your exercise.");
  }

  const { supabase, user } = await requireUser();
  const existing = await findExerciseByName(trimmed, { supabase, user });
  if (existing) return existing;

  const { data, error } = await supabase
    .from("exercise_library")
    .insert({ user_id: user.id, name: trimmed, category, default_unit: defaultUnit })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/workouts", "layout");
  return data as ExerciseLibraryItem;
}

/** Deletion is DB-enforced, not just app-side: `template_exercises`/`workout_session_exercises` reference this table `on delete restrict`, so Postgres itself blocks removing an exercise that's still used anywhere — surfaced here as a plain-language message instead of the raw foreign-key error. */
export async function deleteExercise(id: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("exercise_library").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    if (error.code === "23503") {
      throw new Error("This exercise is used in a template or workout session — remove it there first.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/workouts", "layout");
  revalidatePath("/", "layout");
}
