"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { PeriodLog } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function dayBefore(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Logs a period start date — entirely optional, one row per cycle, never
 * required. Any still-open earlier period (ended_on null, started before
 * this one) is auto-closed the day before this new start, since a new
 * period starting is itself proof the previous one ended.
 */
export async function logPeriodStart(startedOn: string): Promise<PeriodLog> {
  if (!DATE_PATTERN.test(startedOn)) {
    throw new Error("Invalid date.");
  }

  const { supabase, user } = await requireUser();

  const { data: openEarlier, error: openError } = await supabase
    .from("period_logs")
    .select("id, started_on")
    .eq("user_id", user.id)
    .is("ended_on", null)
    .lt("started_on", startedOn)
    .order("started_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (openError) throw new Error(openError.message);

  if (openEarlier) {
    const { error: closeError } = await supabase
      .from("period_logs")
      .update({ ended_on: dayBefore(startedOn) })
      .eq("id", openEarlier.id);

    if (closeError) throw new Error(closeError.message);
  }

  const { data, error } = await supabase
    .from("period_logs")
    .upsert({ user_id: user.id, started_on: startedOn }, { onConflict: "user_id,started_on" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  return data;
}

/** Marks the current (most recent, still-open) period as over as of `endedOn`. */
export async function markPeriodEnded(endedOn: string): Promise<PeriodLog> {
  if (!DATE_PATTERN.test(endedOn)) {
    throw new Error("Invalid date.");
  }

  const { supabase, user } = await requireUser();

  const { data: open, error: findError } = await supabase
    .from("period_logs")
    .select("id, started_on")
    .eq("user_id", user.id)
    .is("ended_on", null)
    .order("started_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!open) throw new Error("No ongoing period to mark as over.");
  if (Date.parse(endedOn) < Date.parse(open.started_on)) {
    throw new Error("End date can't be before the period's start date.");
  }

  const { data, error } = await supabase
    .from("period_logs")
    .update({ ended_on: endedOn })
    .eq("id", open.id)
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
