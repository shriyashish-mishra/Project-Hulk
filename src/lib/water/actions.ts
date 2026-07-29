"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { getUserContext } from "@/lib/profile/context";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { WaterLog } from "./types";
import { getWaterLogForDate } from "./queries";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_GLASSES = 20;

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/**
 * Upserts today's glass count — one row per day, same pattern as food/workout
 * logs. A brand-new day's row seeds target_glasses from the profile's
 * personalized hydration target instead of the column default; an existing
 * row's target is left alone. `ctx` lets callers outside a browser request
 * (quick-log shortcuts, MCP) inject an already-authenticated
 * `{ supabase, user }` instead of `requireUser()` — when given, the
 * hydration-target lookup (which itself needs a cookie-bound session) is
 * skipped in favor of the column default, since it's a nice-to-have, not
 * required for the write to succeed.
 */
export async function setGlassCount(
  count: number,
  loggedOn: string,
  ctx?: AuthContext,
): Promise<WaterLog> {
  if (!DATE_PATTERN.test(loggedOn)) {
    throw new Error("Invalid date.");
  }
  const clamped = Math.max(0, Math.min(MAX_GLASSES, Math.round(count)));

  const { supabase, user } = ctx ?? (await requireUser());

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

  if (!existing && !ctx) {
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

/** Adds one glass to today's count — the operation a one-tap shortcut needs, since it has no idea what the current count is. */
export async function incrementGlassCount(loggedOn: string, ctx?: AuthContext): Promise<WaterLog> {
  const existing = await getWaterLogForDate(loggedOn, ctx);
  return setGlassCount((existing?.glass_count ?? 0) + 1, loggedOn, ctx);
}
