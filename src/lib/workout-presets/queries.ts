import { requireUser } from "@/lib/supabase/auth";
import type { WorkoutPreset } from "./types";

export async function getWorkoutPresets(): Promise<WorkoutPreset[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_presets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
