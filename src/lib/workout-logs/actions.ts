"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { WorkoutLog } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Upserts the workout note for `loggedOn` — one entry per day. */
export async function saveWorkoutLog(
  rawText: string,
  loggedOn: string,
): Promise<WorkoutLog> {
  if (!rawText.trim()) {
    throw new Error("Write your workout.");
  }
  if (!DATE_PATTERN.test(loggedOn)) {
    throw new Error("Invalid date.");
  }

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_logs")
    .upsert(
      {
        user_id: user.id,
        raw_text: rawText.trim(),
        logged_on: loggedOn,
      },
      { onConflict: "user_id,logged_on" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
  return data;
}

export async function deleteWorkoutLog(loggedOn: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("workout_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("logged_on", loggedOn);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
}
