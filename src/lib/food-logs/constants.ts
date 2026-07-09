import type { MealType } from "./types";

export const MEAL_SECTIONS: ReadonlyArray<{ type: MealType; label: string }> = [
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "snacks", label: "Snacks" },
  { type: "dinner", label: "Dinner" },
];
