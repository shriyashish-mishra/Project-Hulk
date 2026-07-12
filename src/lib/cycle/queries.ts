import { requireUser } from "@/lib/supabase/auth";
import type { PeriodLog } from "./types";

/** The single most recent logged period start, regardless of date. */
export async function getLatestPeriodLog(): Promise<PeriodLog | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("period_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("started_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** Every logged period start, oldest first — used to compute a real average cycle length once there's enough history. */
export async function getAllPeriodLogsAscending(): Promise<PeriodLog[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("period_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("started_on", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
