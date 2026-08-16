import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { classifyExerciseMetValue } from "@/lib/gemini/client";
import type { ExerciseCategory } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

// A MET this far outside plausible human exercise intensity means the
// model didn't return a usable number (empty, prose, a wildly wrong
// value) — reject rather than cache garbage that would then silently
// distort every future calorie estimate for this exercise.
const MIN_PLAUSIBLE_MET = 1;
const MAX_PLAUSIBLE_MET = 15;

/** Pulls the first plausible number out of Gemini's reply — tolerates it wrapping the number in a stray word or period despite the prompt asking for bare output. */
function parseMetValue(text: string): number | null {
  const match = text.match(/\d+(\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  if (!Number.isFinite(value) || value < MIN_PLAUSIBLE_MET || value > MAX_PLAUSIBLE_MET) return null;
  return value;
}

/**
 * Classifies and caches an exercise's MET value — the one-time Gemini call
 * behind the workout-session calorie estimate (see estimate.ts). Returns
 * the cached value immediately if one already exists; otherwise calls
 * Gemini, caches the result on `exercise_library.met_value`, and returns
 * it. Never throws: a classification failure (Gemini down, an
 * unparseable reply) is logged and returns null so the caller falls back
 * to the flat per-set/per-minute estimate for just this one exercise,
 * rather than blocking whatever action triggered it (adding an exercise,
 * starting a session).
 */
export async function ensureExerciseMetValue(
  exerciseId: string,
  name: string,
  category: ExerciseCategory,
  ctx: AuthContext,
): Promise<number | null> {
  const { supabase, user } = ctx;

  const { data: existing, error: fetchError } = await supabase
    .from("exercise_library")
    .select("met_value")
    .eq("id", exerciseId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (fetchError) throw new Error(fetchError.message);
  if (existing?.met_value != null) return Number(existing.met_value);

  try {
    const raw = await classifyExerciseMetValue(name, category);
    const metValue = parseMetValue(raw);
    if (metValue === null) {
      console.error(`[exercise-library/met] Unparseable MET response for "${name}": ${raw.slice(0, 100)}`);
      return null;
    }

    const { error: updateError } = await supabase
      .from("exercise_library")
      .update({ met_value: metValue })
      .eq("id", exerciseId)
      .eq("user_id", user.id);
    if (updateError) throw new Error(updateError.message);

    return metValue;
  } catch (err) {
    console.error(`[exercise-library/met] Classification failed for "${name}":`, err);
    return null;
  }
}
