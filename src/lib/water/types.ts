import type { Database } from "@/lib/supabase/database.types";

export type WaterLog = Database["public"]["Tables"]["water_logs"]["Row"];
