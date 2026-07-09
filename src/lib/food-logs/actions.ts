"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/date";
import { MEAL_SECTIONS } from "./constants";
import type { FoodLog, MealType } from "./types";

export interface FoodLogFormInput {
  mealType: MealType;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinGrams: number;
}

const VALID_MEAL_TYPES = new Set<MealType>(
  MEAL_SECTIONS.map((section) => section.type),
);

function assertValidInput(input: FoodLogFormInput) {
  if (!VALID_MEAL_TYPES.has(input.mealType)) {
    throw new Error("Invalid meal type.");
  }
  if (!input.name.trim()) {
    throw new Error("Food name is required.");
  }
  if (!input.unit.trim()) {
    throw new Error("Unit is required.");
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("Quantity must be greater than 0.");
  }
  if (!Number.isFinite(input.calories) || input.calories < 0) {
    throw new Error("Calories must be 0 or greater.");
  }
  if (!Number.isFinite(input.proteinGrams) || input.proteinGrams < 0) {
    throw new Error("Protein must be 0 or greater.");
  }
}

export async function addFoodLog(
  input: FoodLogFormInput,
): Promise<FoodLog> {
  assertValidInput(input);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_logs")
    .insert({
      meal_type: input.mealType,
      name: input.name.trim(),
      quantity: input.quantity,
      unit: input.unit.trim(),
      calories: Math.round(input.calories),
      protein_grams: input.proteinGrams,
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
      name: input.name.trim(),
      quantity: input.quantity,
      unit: input.unit.trim(),
      calories: Math.round(input.calories),
      protein_grams: input.proteinGrams,
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
