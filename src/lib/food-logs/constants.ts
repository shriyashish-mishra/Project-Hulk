import type { MealType } from "./types";

export const MEAL_SECTIONS: ReadonlyArray<{ type: MealType; label: string }> = [
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "snacks", label: "Snacks" },
  { type: "dinner", label: "Dinner" },
];

export const FOOD_UNITS = [
  "g",
  "ml",
  "pieces",
  "bowls",
  "cups",
  "scoops",
  "tbsp",
] as const;

// Placeholders until Settings (targets) ships and these become configurable.
export const DEFAULT_DAILY_CALORIE_TARGET = 2200;
export const DEFAULT_DAILY_PROTEIN_TARGET_G = 150;
