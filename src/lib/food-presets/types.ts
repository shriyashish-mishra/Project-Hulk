import type { Database } from "@/lib/supabase/database.types";

export type FoodPreset = Database["public"]["Tables"]["food_presets"]["Row"];
