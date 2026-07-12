"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { getUserContext } from "@/lib/profile/context";
import type { Database } from "@/lib/supabase/database.types";
import type { SleepLog } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_MINUTES = 24 * 60;

/** Upserts today's sleep duration — one row per day, same pattern as water/food/workout. A brand-new day's row seeds target_minutes from the profile's age-based sleep target instead of the column default; an existing row's target is left alone. */
export async function saveSleepDuration(
  durationMinutes: number,
  loggedOn: string,
): Promise<SleepLog> {
  if (!DATE_PATTERN.test(loggedOn)) {
    throw new Error("Invalid date.");
  }
  const clamped = Math.max(0, Math.min(MAX_MINUTES, Math.round(durationMinutes)));

  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("sleep_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", loggedOn)
    .maybeSingle();

  const payload: Database["public"]["Tables"]["sleep_logs"]["Insert"] = {
    user_id: user.id,
    date: loggedOn,
    duration_minutes: clamped,
    updated_at: new Date().toISOString(),
  };

  if (!existing) {
    const { sleepTargetMinutes } = await getUserContext();
    if (sleepTargetMinutes) payload.target_minutes = sleepTargetMinutes;
  }

  const { data, error } = await supabase
    .from("sleep_logs")
    .upsert(payload, { onConflict: "user_id,date" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
  return data;
}

export async function deleteSleepLog(loggedOn: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("sleep_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("date", loggedOn);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
}
