"use server";

import { revalidatePath } from "next/cache";
import { getExercisesByIds } from "@/lib/exercise-library/queries";
import { requireUser } from "@/lib/supabase/auth";
import { mapTemplateExerciseRow, touchTemplate } from "./queries";
import type { TemplateExercise, TemplateExerciseInput, WorkoutTemplate } from "./types";

const DEFAULT_TEMPLATE_NAME = "New Template";

function revalidateTemplates() {
  revalidatePath("/workouts", "layout");
}

export async function createTemplate(name: string): Promise<WorkoutTemplate> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_templates")
    .insert({ user_id: user.id, name: name.trim() || DEFAULT_TEMPLATE_NAME })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidateTemplates();
  return data;
}

export async function renameTemplate(templateId: string, name: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("workout_templates")
    .update({ name: name.trim() || DEFAULT_TEMPLATE_NAME, updated_at: new Date().toISOString() })
    .eq("id", templateId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateTemplates();
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("workout_templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidateTemplates();
}

export async function addTemplateExercise(
  templateId: string,
  exerciseId: string,
  input: TemplateExerciseInput,
): Promise<TemplateExercise> {
  const { supabase, user } = await requireUser();

  const { data: maxRow, error: maxError } = await supabase
    .from("template_exercises")
    .select("position")
    .eq("template_id", templateId)
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxError) throw new Error(maxError.message);
  const nextPosition = maxRow ? maxRow.position + 1 : 0;

  const { data, error } = await supabase
    .from("template_exercises")
    .insert({ user_id: user.id, template_id: templateId, exercise_id: exerciseId, position: nextPosition, ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await touchTemplate(supabase, templateId, user.id);
  const exercisesById = await getExercisesByIds([exerciseId], { supabase, user });
  const exercise = exercisesById.get(exerciseId);
  if (!exercise) throw new Error(`Exercise ${exerciseId} not found`);

  revalidateTemplates();
  return mapTemplateExerciseRow(data, exercise);
}

export async function updateTemplateExercise(
  templateExerciseId: string,
  input: TemplateExerciseInput,
): Promise<TemplateExercise> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("template_exercises")
    .update(input)
    .eq("id", templateExerciseId)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await touchTemplate(supabase, data.template_id, user.id);
  const exercisesById = await getExercisesByIds([data.exercise_id], { supabase, user });
  const exercise = exercisesById.get(data.exercise_id);
  if (!exercise) throw new Error(`Exercise ${data.exercise_id} not found`);

  revalidateTemplates();
  return mapTemplateExerciseRow(data, exercise);
}

export async function removeTemplateExercise(templateExerciseId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("template_exercises")
    .delete()
    .eq("id", templateExerciseId)
    .eq("user_id", user.id)
    .select("template_id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) await touchTemplate(supabase, data.template_id, user.id);
  revalidateTemplates();
}

/** Swaps this exercise's `position` with its immediate neighbor — a no-op if it's already at that edge of the list. */
export async function moveTemplateExercise(
  templateId: string,
  templateExerciseId: string,
  direction: "up" | "down",
): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: ordered, error } = await supabase
    .from("template_exercises")
    .select("id, position")
    .eq("template_id", templateId)
    .eq("user_id", user.id)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);

  const index = ordered.findIndex((row) => row.id === templateExerciseId);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || neighborIndex < 0 || neighborIndex >= ordered.length) return;

  const current = ordered[index];
  const neighbor = ordered[neighborIndex];

  const { error: currentError } = await supabase
    .from("template_exercises")
    .update({ position: neighbor.position })
    .eq("id", current.id);
  if (currentError) throw new Error(currentError.message);

  const { error: neighborError } = await supabase
    .from("template_exercises")
    .update({ position: current.position })
    .eq("id", neighbor.id);
  if (neighborError) throw new Error(neighborError.message);

  await touchTemplate(supabase, templateId, user.id);
  revalidateTemplates();
}
