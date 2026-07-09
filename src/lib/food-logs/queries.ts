import { createClient } from "@/lib/supabase/server";
import type { FoodLog } from "./types";

export async function getFoodLogsForDate(loggedOn: string): Promise<FoodLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_logs")
    .select("*")
    .eq("logged_on", loggedOn)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
