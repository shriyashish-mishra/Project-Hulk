"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getExercisesByIds } from "@/lib/exercise-library/queries";
import { ensureExerciseMetValue } from "@/lib/exercise-library/met";
import { getTemplateWithExercises, touchTemplate } from "@/lib/workout-templates/queries";
import { requireUser } from "@/lib/supabase/auth";
import { getLocalDateString } from "@/lib/date";
import { getCurrentUserTimeZone } from "@/lib/profile/queries";
import { getUserContextForCtx } from "@/lib/mcp/user-context";
import { saveWorkoutLog } from "@/lib/workout-logs/actions";
import { buildCanonicalWorkoutText } from "./canonical-text";
import { estimateCalories } from "./estimate";
import { applyRecommendationsToTemplate } from "./exercise-progress";
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
  const timeZone = await getCurrentUserTimeZone();

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      template_id: template.id,
      template_name_snapshot: template.name,
      logged_on: getLocalDateString(new Date(), timeZone),
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

  // Classify any of this template's exercises that have never been used in
  // a session yet — deferred via `after()` so starting a workout isn't
  // held up waiting on however many Gemini calls that is; this one
  // session's estimate for those specific exercises just uses the flat
  // fallback (see estimate.ts) until the value is cached, same as any
  // exercise added mid-session before its classification resolves.
  const unclassified = template.exercises.filter((exercise) => exercise.met_value === null);
  if (unclassified.length > 0) {
    after(async () => {
      await Promise.all(
        unclassified.map((exercise) =>
          ensureExerciseMetValue(exercise.exercise_id, exercise.exercise_name, exercise.category, { supabase, user }),
        ),
      );
    });
  }

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

  // The one place this classification is awaited rather than deferred
  // (see startSessionFromTemplate) — this is a single, deliberate,
  // user-initiated "I just did this exercise" tap, not a batch, so a
  // few seconds' wait for a genuinely new exercise's MET is acceptable
  // and means the estimate is right immediately rather than after a
  // reload. Every subsequent exercise reuses the cache and returns
  // instantly.
  if (exercise.met_value === null) {
    const metValue = await ensureExerciseMetValue(exercise.id, exercise.name, exercise.category, { supabase, user });
    exercise.met_value = metValue;
  }

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

/**
 * The one-tap "no, keep it at X" next to a "Hulk suggests" badge — reverts
 * both this session's own weight AND the template's default_weight back to
 * what was actually lifted last time, fully undoing what
 * `applyRecommendationsToTemplate` silently wrote after the prior session
 * completed. Without the template half of this, the same "wrong" weight
 * would just come back the next time this template starts a session.
 */
export async function revertSuggestedWeight(
  sessionExerciseId: string,
  sessionId: string,
  templateId: string | null,
  exerciseId: string,
  previousWeight: number,
): Promise<SessionExercise> {
  const updated = await updateSessionExercise(sessionExerciseId, sessionId, { weight: previousWeight });

  if (templateId) {
    const { supabase, user } = await requireUser();
    const { data: templateExercise, error: findError } = await supabase
      .from("template_exercises")
      .select("id")
      .eq("template_id", templateId)
      .eq("exercise_id", exerciseId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (findError) throw new Error(findError.message);

    if (templateExercise) {
      const { error: updateError } = await supabase
        .from("template_exercises")
        .update({ default_weight: previousWeight })
        .eq("id", templateExercise.id);
      if (updateError) throw new Error(updateError.message);
      await touchTemplate(supabase, templateId, user.id);
    }
  }

  return updated;
}

/**
 * On-demand counterpart to `revertSuggestedWeight` above, for the opposite
 * direction: pushes this exercise's CURRENT session values into the
 * template's defaults, on request rather than automatically. Covers both
 * cases the same way — an exercise the template already had (its
 * `template_exercises` row is updated in place) and one added mid-session
 * that wasn't on the template at all (a new row is appended, so it's part
 * of the template from here on). Never called implicitly: this is the
 * explicit "yes, make this the new default" action a user takes per
 * exercise, exactly because a session deviating from its template
 * shouldn't silently rewrite the template just by being logged.
 */
export async function applyExerciseAsTemplateDefault(sessionExerciseId: string, sessionId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const session = await getSessionWithExercises(sessionId, { supabase, user });
  if (!session) throw new Error("Session not found.");
  if (!session.template_id) throw new Error("This workout wasn't started from a template.");

  const exercise = session.exercises.find((entry) => entry.id === sessionExerciseId);
  if (!exercise) throw new Error("Exercise not found in this session.");

  const defaults = {
    default_sets: exercise.sets_planned,
    default_reps: exercise.reps,
    default_weight: exercise.weight,
    default_weight_unit: exercise.weight_unit,
    default_duration_minutes: exercise.duration_minutes,
    default_incline_percent: exercise.incline_percent,
    default_speed_kph: exercise.speed_kph,
    notes: exercise.notes,
  };

  const { data: existing, error: findError } = await supabase
    .from("template_exercises")
    .select("id")
    .eq("template_id", session.template_id)
    .eq("exercise_id", exercise.exercise_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (findError) throw new Error(findError.message);

  if (existing) {
    const { error: updateError } = await supabase
      .from("template_exercises")
      .update(defaults)
      .eq("id", existing.id);
    if (updateError) throw new Error(updateError.message);
  } else {
    const { data: maxRow, error: maxError } = await supabase
      .from("template_exercises")
      .select("position")
      .eq("template_id", session.template_id)
      .eq("user_id", user.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxError) throw new Error(maxError.message);
    const nextPosition = maxRow ? maxRow.position + 1 : 0;

    const { error: insertError } = await supabase.from("template_exercises").insert({
      user_id: user.id,
      template_id: session.template_id,
      exercise_id: exercise.exercise_id,
      position: nextPosition,
      ...defaults,
    });
    if (insertError) throw new Error(insertError.message);
  }

  await touchTemplate(supabase, session.template_id, user.id);
  revalidatePath("/workouts");
  revalidatePath("/workouts/templates");
  revalidateSession(sessionId);
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

  const userContext = await getUserContextForCtx({ supabase, user });
  const totalCalories = estimateCalories(session.exercises, userContext.latestWeightKg);
  const { error } = await supabase
    .from("workout_sessions")
    .update({ completed_at: new Date().toISOString(), total_calories: totalCalories })
    .eq("id", sessionId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  await applyRecommendationsToTemplate(session, { supabase, user });

  const canonicalText = buildCanonicalWorkoutText(session.template_name_snapshot, session.exercises);
  await saveWorkoutLog(canonicalText, session.logged_on, undefined, { supabase, user });

  revalidateSession(sessionId);
  revalidatePath("/workouts");
  revalidatePath("/");
  revalidatePath(`/log/${session.logged_on}`);
}
