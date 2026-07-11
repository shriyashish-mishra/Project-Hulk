import type { Database } from "@/lib/supabase/database.types";

export type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];
