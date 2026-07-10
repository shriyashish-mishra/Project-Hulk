import { requireUser } from "@/lib/supabase/auth";
import type { FoodLog } from "./types";

export async function getFoodLogsForDate(loggedOn: string): Promise<FoodLog[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("logged_on", loggedOn)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
