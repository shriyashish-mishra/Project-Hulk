"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import type { WeightLog } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_KG = 20;
const MAX_KG = 400;

/** Upserts a weight measurement for `measuredOn` — one entry per day, same pattern as the other signals. */
export async function saveWeight(weightKg: number, measuredOn: string): Promise<WeightLog> {
  if (!DATE_PATTERN.test(measuredOn)) {
    throw new Error("Invalid date.");
  }
  if (!Number.isFinite(weightKg) || weightKg < MIN_KG || weightKg > MAX_KG) {
    throw new Error("Enter a weight between 20 and 400 kg.");
  }
  const rounded = Math.round(weightKg * 10) / 10;

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("weight_logs")
    .upsert(
      { user_id: user.id, measured_on: measuredOn, weight_kg: rounded },
      { onConflict: "user_id,measured_on" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${measuredOn}`);
  return data;
}

export async function deleteWeightLog(measuredOn: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("weight_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("measured_on", measuredOn);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${measuredOn}`);
}
