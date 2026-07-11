"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { getUserContext } from "@/lib/profile/context";
import type { Database } from "@/lib/supabase/database.types";
import type { WaterLog } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_GLASSES = 20;

/** Upserts today's glass count — one row per day, same pattern as food/workout logs. A brand-new day's row seeds target_glasses from the profile's personalized hydration target instead of the column default; an existing row's target is left alone. */
export async function setGlassCount(count: number, loggedOn: string): Promise<WaterLog> {
  if (!DATE_PATTERN.test(loggedOn)) {
    throw new Error("Invalid date.");
  }
  const clamped = Math.max(0, Math.min(MAX_GLASSES, Math.round(count)));

  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("water_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", loggedOn)
    .maybeSingle();

  const payload: Database["public"]["Tables"]["water_logs"]["Insert"] = {
    user_id: user.id,
    date: loggedOn,
    glass_count: clamped,
    updated_at: new Date().toISOString(),
  };

  if (!existing) {
    const { hydrationTargetGlasses } = await getUserContext();
    if (hydrationTargetGlasses) payload.target_glasses = hydrationTargetGlasses;
  }

  const { data, error } = await supabase
    .from("water_logs")
    .upsert(payload, { onConflict: "user_id,date" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
  return data;
}
