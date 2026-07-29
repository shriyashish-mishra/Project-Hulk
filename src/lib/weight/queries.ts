import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { WeightLog } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/** `ctx` lets callers outside a browser request (MCP, quick-log) inject an already-authenticated context instead of `requireUser()`. */
export async function getWeightLogForDate(measuredOn: string, ctx?: AuthContext): Promise<WeightLog | null> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("measured_on", measuredOn)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getWeightLogsInRange(
  startDate: string,
  endDate: string,
): Promise<WeightLog[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("measured_on", startDate)
    .lte("measured_on", endDate)
    .order("measured_on", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/** Most recent measurement strictly before `beforeDate` — used as a trend baseline when the period itself has no earlier entry. `ctx` lets callers outside a browser request (MCP, quick-log) inject an already-authenticated context instead of `requireUser()`. */
export async function getLatestWeightLogBefore(
  beforeDate: string,
  ctx?: AuthContext,
): Promise<WeightLog | null> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .lt("measured_on", beforeDate)
    .order("measured_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
