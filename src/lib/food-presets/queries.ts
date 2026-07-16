import { requireUser } from "@/lib/supabase/auth";
import type { FoodPreset } from "./types";

export async function getFoodPresets(): Promise<FoodPreset[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("food_presets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
