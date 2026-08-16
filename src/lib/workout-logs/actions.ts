"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { WorkoutLog } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Upserts the workout note for `loggedOn` — one entry per day. `ctx` lets
 * callers outside a browser request (the MCP server) inject an
 * already-authenticated `{ supabase, user }` instead of `requireUser()`.
 *
 * `nonWorkoutSteps` is a separate field from `rawText`, deliberately —
 * see the migration's comment. `undefined` (the default, for every
 * existing caller that doesn't pass it) omits the column from the upsert
 * payload entirely, so it's left untouched on an existing row rather than
 * being silently cleared; pass `null` explicitly to clear it.
 */
export async function saveWorkoutLog(
  rawText: string,
  loggedOn: string,
  nonWorkoutSteps?: number | null,
  ctx?: AuthContext,
): Promise<WorkoutLog> {
  if (!rawText.trim()) {
    throw new Error("Write your workout.");
  }
  if (!DATE_PATTERN.test(loggedOn)) {
    throw new Error("Invalid date.");
  }
  if (nonWorkoutSteps != null && (!Number.isFinite(nonWorkoutSteps) || nonWorkoutSteps < 0)) {
    throw new Error("Steps must be a positive number.");
  }

  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("workout_logs")
    .upsert(
      {
        user_id: user.id,
        raw_text: rawText.trim(),
        logged_on: loggedOn,
        ...(nonWorkoutSteps !== undefined ? { non_workout_steps: nonWorkoutSteps } : {}),
      },
      { onConflict: "user_id,logged_on" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
  return data;
}

/**
 * How many days (including today, if already saved) have this exact
 * workout text logged — the signal behind "you've logged this 3 times,
 * save it as a preset?" A plain trimmed exact match, not fuzzy: this is a
 * nudge, not a hard rule, and false negatives (missing a near-duplicate)
 * are far cheaper than false positives (nagging on unrelated entries).
 */
export async function countMatchingWorkoutLogs(rawText: string): Promise<number> {
  const trimmed = rawText.trim();
  if (!trimmed) return 0;

  const { supabase, user } = await requireUser();
  const { count, error } = await supabase
    .from("workout_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("raw_text", trimmed);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function deleteWorkoutLog(loggedOn: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("workout_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("logged_on", loggedOn);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
}
