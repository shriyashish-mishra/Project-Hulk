"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { WaterLog } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_GLASSES = 20;

/** Upserts today's glass count — one row per day, same pattern as food/workout logs. */
export async function setGlassCount(count: number, loggedOn: string): Promise<WaterLog> {
  if (!DATE_PATTERN.test(loggedOn)) {
    throw new Error("Invalid date.");
  }
  const clamped = Math.max(0, Math.min(MAX_GLASSES, Math.round(count)));

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("water_logs")
    .upsert(
      {
        user_id: user.id,
        date: loggedOn,
        glass_count: clamped,
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
