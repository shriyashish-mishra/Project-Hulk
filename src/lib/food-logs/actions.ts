"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { MEAL_SECTIONS } from "./constants";
import type { FoodLog, MealType } from "./types";

export interface MealLogInput {
  mealType: MealType;
  rawText: string;
}

const VALID_MEAL_TYPES = new Set<MealType>(
  MEAL_SECTIONS.map((section) => section.type),
);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertValidInput(input: MealLogInput, loggedOn: string) {
  if (!VALID_MEAL_TYPES.has(input.mealType)) {
    throw new Error("Invalid meal type.");
  }
  if (!input.rawText.trim()) {
    throw new Error("Write what you ate.");
  }
  if (!DATE_PATTERN.test(loggedOn)) {
    throw new Error("Invalid date.");
  }
}

/** Upserts the note for a meal type on `loggedOn` — one entry per meal per day. */
export async function saveMealLog(
  input: MealLogInput,
  loggedOn: string,
): Promise<FoodLog> {
  assertValidInput(input, loggedOn);

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("food_logs")
    .upsert(
      {
        user_id: user.id,
        meal_type: input.mealType,
        raw_text: input.rawText.trim(),
        logged_on: loggedOn,
      },
      { onConflict: "user_id,meal_type,logged_on" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
  return data;
}

export async function deleteMealLog(
  mealType: MealType,
  loggedOn: string,
): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("food_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("meal_type", mealType)
    .eq("logged_on", loggedOn);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/log/${loggedOn}`);
}
