import { requireUser } from "@/lib/supabase/auth";
import type { SleepLog } from "./types";

export async function getSleepLogForDate(loggedOn: string): Promise<SleepLog | null> {
  const { supabase, user } = await requireUser();
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
