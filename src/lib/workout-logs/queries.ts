import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { WorkoutLog } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/** `ctx` lets callers outside a browser request (MCP, quick-log) inject an already-authenticated context instead of `requireUser()`. */
export async function getWorkoutLogForDate(
  loggedOn: string,
  ctx?: AuthContext,
): Promise<WorkoutLog | null> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("logged_on", loggedOn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** Most recent logged workouts, newest first — backs the Workouts page's history list. */
export async function getRecentWorkoutLogs(limit: number, ctx?: AuthContext): Promise<WorkoutLog[]> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_on", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}
