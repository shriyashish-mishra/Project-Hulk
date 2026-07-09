import type { Database } from "@/lib/supabase/database.types";

export type WorkoutLog = Database["public"]["Tables"]["workout_logs"]["Row"];
