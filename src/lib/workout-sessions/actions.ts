"use server";

import { revalidatePath } from "next/cache";
import { getExercisesByIds } from "@/lib/exercise-library/queries";
import { getTemplateWithExercises } from "@/lib/workout-templates/queries";
import { requireUser } from "@/lib/supabase/auth";
import { getLocalDateString } from "@/lib/date";
import { saveWorkoutLog } from "@/lib/workout-logs/actions";
import { buildCanonicalWorkoutText } from "./canonical-text";
import { estimateCalories } from "./estimate";
import { mapSessionExerciseRow, getSessionWithExercises } from "./queries";
import type { SessionExercise, SessionExerciseInput, SessionExerciseUpdate, WorkoutSessionWithExercises } from "./types";

function revalidateSession(sessionId: string) {
  revalidatePath(`/workouts/session/${sessionId}`);
}

/** Copies every one of the template's exercises into a fresh session, defaults and all — from here on, editing a session never touches the template. */
export async function startSessionFromTemplate(templateId: string): Promise<WorkoutSessionWithExercises> {
  const { supabase, user } = await requireUser();
  const template = await getTemplateWithExercises(templateId, { supabase, user });
  if (!template) throw new Error("Template not found.");

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      template_id: template.id,
      template_name_snapshot: template.name,
      logged_on: getLocalDateString(),
    })
    .select()
    .single();
  if (sessionError) throw new Error(sessionError.message);

  if (template.exercises.length > 0) {
    const { error: exercisesError } = await supabase.from("workout_session_exercises").insert(
      template.exercises.map((exercise) => ({
        user_id: user.id,
        session_id: session.id,
        exercise_id: exercise.exercise_id,
        position: exercise.position,
        sets_planned: exercise.default_sets,
        reps: exercise.default_reps,
        weight: exercise.default_weight,
        weight_unit: exercise.default_weight_unit,
        duration_minutes: exercise.default_duration_minutes,
        incline_percent: exercise.default_incline_percent,
        speed_kph: exercise.default_speed_kph,
        notes: exercise.notes,
      })),
    );
    if (exercisesError) throw new Error(exercisesError.message);
  }

  const result = await getSessionWithExercises(session.id, { supabase, user });
  if (!result) throw new Error("Session missing immediately after creation.");

  revalidatePath("/workouts");
  return result;
}

/** Adds an exercise the user did but wasn't on the template — appended after whatever's already in the session. */
export async function addSessionExercise(
  sessionId: string,
  exerciseId: string,
  input: SessionExerciseInput,
): Promise<SessionExercise> {
  const { supabase, user } = await requireUser();

  const { data: maxRow, error: maxError } = await supabase
    .from("workout_session_exercises")
    .select("position")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxError) throw new Error(maxError.message);
  const nextPosition = maxRow ? maxRow.position + 1 : 0;

  const { data, error } = await supabase
    .from("workout_session_exercises")
    .insert({ user_id: user.id, session_id: sessionId, exercise_id: exerciseId, position: nextPosition, ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const exercisesById = await getExercisesByIds([exerciseId], { supabase, user });
  const exercise = exercisesById.get(exerciseId);
  if (!exercise) throw new Error(`Exercise ${exerciseId} not found`);

  revalidateSession(sessionId);
  return mapSessionExerciseRow(data, exercise);
}

export async function updateSessionExercise(
  sessionExerciseId: string,
  sessionId: string,
  updates: SessionExerciseUpdate,
): Promise<SessionExercise> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_session_exercises")
    .update(updates)
    .eq("id", sessionExerciseId)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  const exercisesById = await getExercisesByIds([data.exercise_id], { supabase, user });
  const exercise = exercisesById.get(data.exercise_id);
  if (!exercise) throw new Error(`Exercise ${data.exercise_id} not found`);

  revalidateSession(sessionId);
  return mapSessionExerciseRow(data, exercise);
}

/** Tapping a filled dot undoes back to it; tapping an empty one marks up through it — so finishing sets in order isn't required. */
export async function toggleSessionSet(
  exercise: SessionExercise,
  setIndex: number,
): Promise<SessionExercise> {
  const nextCompleted = setIndex < exercise.sets_completed ? setIndex : setIndex + 1;
  return updateSessionExercise(exercise.id, exercise.session_id, { sets_completed: nextCompleted });
}

/**
 * Marks the session complete and writes its canonical text through the
 * SAME `saveWorkoutLog` action the manual free-text form already calls —
 * the nightly-report pipeline reads `workout_logs.raw_text` exactly as
 * before, with no idea a template or session was ever involved.
 */
export async function completeSession(sessionId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const session = await getSessionWithExercises(sessionId, { supabase, user });
  if (!session) throw new Error("Session not found.");

  const totalCalories = estimateCalories(session.exercises);
  const { error } = await supabase
    .from("workout_sessions")
    .update({ completed_at: new Date().toISOString(), total_calories: totalCalories })
    .eq("id", sessionId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  const canonicalText = buildCanonicalWorkoutText(session.template_name_snapshot, session.exercises);
  await saveWorkoutLog(canonicalText, session.logged_on, { supabase, user });

  revalidateSession(sessionId);
  revalidatePath("/workouts");
  revalidatePath("/");
  revalidatePath(`/log/${session.logged_on}`);
}
