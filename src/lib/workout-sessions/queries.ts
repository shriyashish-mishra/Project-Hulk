import { getExercisesByIds } from "@/lib/exercise-library/queries";
import type { ExerciseLibraryItem } from "@/lib/exercise-library/types";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { SessionExercise, WorkoutSession, WorkoutSessionWithExercises } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

type SessionExerciseRow = Database["public"]["Tables"]["workout_session_exercises"]["Row"];

export function mapSessionExerciseRow(row: SessionExerciseRow, exercise: ExerciseLibraryItem): SessionExercise {
  return {
    id: row.id,
    session_id: row.session_id,
    exercise_id: row.exercise_id,
    exercise_name: exercise.name,
    category: exercise.category,
    position: row.position,
    sets_planned: row.sets_planned,
    sets_completed: row.sets_completed,
    reps: row.reps,
    weight: row.weight,
    weight_unit: row.weight_unit as SessionExercise["weight_unit"],
    duration_minutes: row.duration_minutes,
    incline_percent: row.incline_percent,
    speed_kph: row.speed_kph,
    notes: row.notes,
  };
}

export async function getSessionWithExercises(
  sessionId: string,
  ctx?: AuthContext,
): Promise<WorkoutSessionWithExercises | null> {
  const { supabase, user } = ctx ?? (await requireUser());

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (sessionError) throw new Error(sessionError.message);
  if (!session) return null;

  const { data: rows, error: exercisesError } = await supabase
    .from("workout_session_exercises")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .order("position", { ascending: true });
  if (exercisesError) throw new Error(exercisesError.message);

  const exerciseIds = [...new Set(rows.map((row) => row.exercise_id))];
  const exercisesById = await getExercisesByIds(exerciseIds, { supabase, user });

  const exercises: SessionExercise[] = rows.map((row) => {
    const exercise = exercisesById.get(row.exercise_id);
    if (!exercise) throw new Error(`Exercise ${row.exercise_id} not found for session row ${row.id}`);
    return mapSessionExerciseRow(row, exercise);
  });

  return { ...session, exercises };
}

const COMPLETED_SESSIONS_LIMIT = 100;

/** Every completed session, newest first — backs the Workouts "History" tab. */
export async function listCompletedSessions(ctx?: AuthContext): Promise<WorkoutSession[]> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(COMPLETED_SESSIONS_LIMIT);

  if (error) throw new Error(error.message);
  return data;
}
