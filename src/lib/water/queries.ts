import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { WaterLog } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/** `ctx` lets callers outside a browser request (quick-log shortcuts, MCP) inject an already-authenticated context instead of `requireUser()`. */
export async function getWaterLogForDate(loggedOn: string, ctx?: AuthContext): Promise<WaterLog | null> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", loggedOn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getWaterLogsInRange(
  startDate: string,
  endDate: string,
): Promise<WaterLog[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
