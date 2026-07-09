"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/date";
import { MEAL_SECTIONS } from "./constants";
import type { FoodLog, MealType } from "./types";

export interface FoodLogFormInput {
  mealType: MealType;
  rawText: string;
}

const VALID_MEAL_TYPES = new Set<MealType>(
  MEAL_SECTIONS.map((section) => section.type),
);

function assertValidInput(input: FoodLogFormInput) {
  if (!VALID_MEAL_TYPES.has(input.mealType)) {
    throw new Error("Invalid meal type.");
  }
  if (!input.rawText.trim()) {
    throw new Error("Describe what you ate.");
  }
}

export async function addFoodLog(input: FoodLogFormInput): Promise<FoodLog> {
  assertValidInput(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_logs")
    .insert({
      meal_type: input.mealType,
      raw_text: input.rawText.trim(),
      logged_on: getLocalDateString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}

export async function updateFoodLog(
  id: string,
  input: FoodLogFormInput,
): Promise<FoodLog> {
  assertValidInput(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_logs")
    .update({
      meal_type: input.mealType,
      raw_text: input.rawText.trim(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  return data;
}

export async function deleteFoodLog(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("food_logs").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
}
