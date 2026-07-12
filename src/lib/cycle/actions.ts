"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { PeriodLog } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Logs a period start date — entirely optional, one row per cycle, never required. */
export async function logPeriodStart(startedOn: string): Promise<PeriodLog> {
  if (!DATE_PATTERN.test(startedOn)) {
    throw new Error("Invalid date.");
  }

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("period_logs")
    .upsert({ user_id: user.id, started_on: startedOn }, { onConflict: "user_id,started_on" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  return data;
}

export async function deletePeriodLog(startedOn: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("period_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("started_on", startedOn);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

/** Stop cycle tracking entirely — wipes all logged period starts, so the Cycle row goes back to "Not tracked" and the nightly prompt drops the section. Nothing else about the account is touched. */
export async function clearAllPeriodLogs(): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("period_logs").delete().eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
