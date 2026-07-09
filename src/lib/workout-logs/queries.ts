import { createClient } from "@/lib/supabase/server";
import type { WorkoutLog } from "./types";

export async function getWorkoutLogForDate(
  loggedOn: string,
): Promise<WorkoutLog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("logged_on", loggedOn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
