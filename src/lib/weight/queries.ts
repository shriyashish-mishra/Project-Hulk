import { requireUser } from "@/lib/supabase/auth";
import type { WeightLog } from "./types";

export async function getWeightLogForDate(measuredOn: string): Promise<WeightLog | null> {
  const { supabase, user } = await requireUser();
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

/** Most recent measurement strictly before `beforeDate` — used as a trend baseline when the period itself has no earlier entry. */
export async function getLatestWeightLogBefore(beforeDate: string): Promise<WeightLog | null> {
  const { supabase, user } = await requireUser();
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
