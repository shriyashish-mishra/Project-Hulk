import type { Database } from "@/lib/supabase/database.types";

export type MealType = Database["public"]["Enums"]["meal_type"];
export type FoodLog = Database["public"]["Tables"]["food_logs"]["Row"];
