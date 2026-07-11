"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { SleepLog } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_MINUTES = 24 * 60;

/** Upserts today's sleep duration — one row per day, same pattern as water/food/workout. */
export async function saveSleepDuration(
  durationMinutes: number,
  loggedOn: string,
): Promise<SleepLog> {
  if (!DATE_PATTERN.test(loggedOn)) {
    throw new Error("Invalid date.");
  }
  const clamped = Math.max(0, Math.min(MAX_MINUTES, Math.round(durationMinutes)));

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("sleep_logs")
    .upsert(
      {
        user_id: user.id,
        date: loggedOn,
        duration_minutes: clamped,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" },
    )
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
