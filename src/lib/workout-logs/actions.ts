"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/date";
import type { WorkoutLog } from "./types";

/** Upserts today's workout note — one entry per day. */
export async function saveWorkoutLog(rawText: string): Promise<WorkoutLog> {
  if (!rawText.trim()) {
    throw new Error("Write your workout.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_logs")
    .upsert(
      {
        raw_text: rawText.trim(),
        logged_on: getLocalDateString(),
      },
      { onConflict: "logged_on" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}

export async function deleteWorkoutLog(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_logs")
    .delete()
    .eq("logged_on", getLocalDateString());

  if (error) throw new Error(error.message);

  revalidatePath("/");
}
