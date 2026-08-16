import { MEAL_SECTIONS } from "@/lib/food-logs/constants";
import type { MealBreakdown } from "@/lib/nightly-report/types";

const mealLabelByType = new Map(
  MEAL_SECTIONS.map((section) => [section.type, section.label]),
);

interface MealBreakdownListProps {
  meals: MealBreakdown[];
}

/** Per-meal split of a day's calories/macros — shared by the Report page and Progress's Today's Nutrition card so the two never drift apart. */
export function MealBreakdownList({ meals }: MealBreakdownListProps) {
  if (meals.length === 0) return null;

  return (
    <ul className="flex flex-col divide-y divide-border">
      {meals.map((meal) => (
        <li key={meal.meal_type} className="flex items-center justify-between gap-2 py-1.5 text-sm">
          <span>{mealLabelByType.get(meal.meal_type) ?? meal.meal_type}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {meal.estimated_calories} kcal
            <span className="ml-1.5">
              P{meal.protein_g} · C{meal.carbs_g} · F{meal.fat_g}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
