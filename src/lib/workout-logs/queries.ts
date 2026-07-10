import { requireUser } from "@/lib/supabase/auth";
import type { WorkoutLog } from "./types";

export async function getWorkoutLogForDate(
  loggedOn: string,
): Promise<WorkoutLog | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("logged_on", loggedOn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
