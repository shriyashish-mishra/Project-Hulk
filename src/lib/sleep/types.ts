import type { Database } from "@/lib/supabase/database.types";

export type SleepLog = Database["public"]["Tables"]["sleep_logs"]["Row"];
