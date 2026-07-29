import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { SleepLog } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/** `ctx` lets callers outside a browser request (MCP, quick-log) inject an already-authenticated context instead of `requireUser()`. */
export async function getSleepLogForDate(loggedOn: string, ctx?: AuthContext): Promise<SleepLog | null> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("sleep_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", loggedOn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getSleepLogsInRange(
  startDate: string,
  endDate: string,
): Promise<SleepLog[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("sleep_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
