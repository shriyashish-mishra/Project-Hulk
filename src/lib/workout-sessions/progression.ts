import { getExercisesByIds } from "@/lib/exercise-library/queries";
import type { ExerciseCategory, WeightUnit } from "@/lib/exercise-library/types";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

export interface ExerciseProgressionPoint {
  logged_on: string;
  weight: number;
  weight_unit: WeightUnit;
  reps: number | null;
}

export interface ExerciseProgression {
  exercise_id: string;
  exercise_name: string;
  category: ExerciseCategory;
  points: ExerciseProgressionPoint[];
}

/**
 * Weight-over-time per exercise, built from completed sessions only — a
 * session started but never finished shouldn't count as a data point.
 * Strength exercises only; cardio has no weight to progress.
 */
export async function getExerciseProgression(ctx?: AuthContext): Promise<ExerciseProgression[]> {
  const { supabase, user } = ctx ?? (await requireUser());

  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sessions")
    .select("id, logged_on")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("logged_on", { ascending: true });
  if (sessionsError) throw new Error(sessionsError.message);
  if (sessions.length === 0) return [];

  const loggedOnBySessionId = new Map(sessions.map((session) => [session.id, session.logged_on]));

  const { data: rows, error: rowsError } = await supabase
    .from("workout_session_exercises")
    .select("*")
    .eq("user_id", user.id)
    .in(
      "session_id",
      sessions.map((session) => session.id),
    )
    .not("weight", "is", null);
  if (rowsError) throw new Error(rowsError.message);
  if (rows.length === 0) return [];

  const exerciseIds = [...new Set(rows.map((row) => row.exercise_id))];
  const exercisesById = await getExercisesByIds(exerciseIds, { supabase, user });

  const byExercise = new Map<string, ExerciseProgression>();
  for (const row of rows) {
    const exercise = exercisesById.get(row.exercise_id);
    const loggedOn = loggedOnBySessionId.get(row.session_id);
    if (!exercise || row.weight == null || !loggedOn) continue;

    if (!byExercise.has(row.exercise_id)) {
      byExercise.set(row.exercise_id, {
        exercise_id: row.exercise_id,
        exercise_name: exercise.name,
        category: exercise.category,
        points: [],
      });
    }
    byExercise.get(row.exercise_id)!.points.push({
      logged_on: loggedOn,
      weight: row.weight,
      weight_unit: (row.weight_unit as WeightUnit | null) ?? exercise.default_unit,
      reps: row.reps,
    });
  }

  const result = [...byExercise.values()].filter((entry) => entry.category === "strength");
  for (const entry of result) {
    entry.points.sort((a, b) => a.logged_on.localeCompare(b.logged_on));
  }
  return result;
}
