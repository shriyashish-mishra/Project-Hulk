import { getExercisesByIds } from "@/lib/exercise-library/queries";
import type { ExerciseLibraryItem } from "@/lib/exercise-library/types";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { TemplateExercise, WorkoutTemplate, WorkoutTemplateWithExercises } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

type TemplateExerciseRow = Database["public"]["Tables"]["template_exercises"]["Row"];

/** Joins a raw `template_exercises` row with the `exercise_library` row it points at — the two-query, application-side join this app uses in place of a typed PostgREST embed. */
export function mapTemplateExerciseRow(row: TemplateExerciseRow, exercise: ExerciseLibraryItem): TemplateExercise {
  return {
    id: row.id,
    template_id: row.template_id,
    exercise_id: row.exercise_id,
    exercise_name: exercise.name,
    category: exercise.category,
    position: row.position,
    default_sets: row.default_sets,
    default_reps: row.default_reps,
    default_weight: row.default_weight,
    default_weight_unit: row.default_weight_unit as TemplateExercise["default_weight_unit"],
    default_rest_seconds: row.default_rest_seconds,
    default_duration_minutes: row.default_duration_minutes,
    default_incline_percent: row.default_incline_percent,
    default_speed_kph: row.default_speed_kph,
    notes: row.notes,
  };
}

export async function touchTemplate(
  supabase: SupabaseClient<Database>,
  templateId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("workout_templates")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", templateId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function listTemplates(ctx?: AuthContext): Promise<WorkoutTemplate[]> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getTemplateWithExercises(
  templateId: string,
  ctx?: AuthContext,
): Promise<WorkoutTemplateWithExercises | null> {
  const { supabase, user } = ctx ?? (await requireUser());

  const { data: template, error: templateError } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("id", templateId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (templateError) throw new Error(templateError.message);
  if (!template) return null;

  const { data: rows, error: exercisesError } = await supabase
    .from("template_exercises")
    .select("*")
    .eq("template_id", templateId)
    .eq("user_id", user.id)
    .order("position", { ascending: true });
  if (exercisesError) throw new Error(exercisesError.message);

  const exerciseIds = [...new Set(rows.map((row) => row.exercise_id))];
  const exercisesById = await getExercisesByIds(exerciseIds, { supabase, user });

  const exercises: TemplateExercise[] = rows.map((row) => {
    const exercise = exercisesById.get(row.exercise_id);
    if (!exercise) throw new Error(`Exercise ${row.exercise_id} not found for template row ${row.id}`);
    return mapTemplateExerciseRow(row, exercise);
  });

  return { ...template, exercises };
}
