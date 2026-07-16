import type { Database } from "@/lib/supabase/database.types";

export type WorkoutPreset = Database["public"]["Tables"]["workout_presets"]["Row"];
