"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/date";
import { MEAL_SECTIONS } from "./constants";
import type { FoodLog, MealType } from "./types";

export interface MealLogInput {
  mealType: MealType;
  rawText: string;
}

const VALID_MEAL_TYPES = new Set<MealType>(
  MEAL_SECTIONS.map((section) => section.type),
);

function assertValidInput(input: MealLogInput) {
  if (!VALID_MEAL_TYPES.has(input.mealType)) {
    throw new Error("Invalid meal type.");
  }
  if (!input.rawText.trim()) {
    throw new Error("Write what you ate.");
  }
}

/** Upserts today's note for a meal type — one entry per meal per day. */
export async function saveMealLog(input: MealLogInput): Promise<FoodLog> {
  assertValidInput(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_logs")
    .upsert(
      {
        meal_type: input.mealType,
        raw_text: input.rawText.trim(),
        logged_on: getLocalDateString(),
      },
      { onConflict: "meal_type,logged_on" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}

export async function deleteMealLog(mealType: MealType): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("food_logs")
    .delete()
    .eq("meal_type", mealType)
    .eq("logged_on", getLocalDateString());

  if (error) throw new Error(error.message);

  revalidatePath("/");
}
