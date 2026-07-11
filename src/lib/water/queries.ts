import { requireUser } from "@/lib/supabase/auth";
import type { WaterLog } from "./types";

export async function getWaterLogForDate(loggedOn: string): Promise<WaterLog | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", loggedOn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
