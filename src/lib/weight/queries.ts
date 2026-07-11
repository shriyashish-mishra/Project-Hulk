import { requireUser } from "@/lib/supabase/auth";
import type { WeightLog } from "./types";

export async function getWeightLogForDate(measuredOn: string): Promise<WeightLog | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("measured_on", measuredOn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
