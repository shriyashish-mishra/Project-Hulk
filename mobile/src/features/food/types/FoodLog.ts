export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snacks: 'Snacks',
  dinner: 'Dinner',
};

/** One free-form note per meal per day — matches the web app's "capture quickly, analyze deeply" philosophy: no calories/macros entered here. */
export interface FoodLog {
  id: number;
  mealType: MealType;
  rawText: string;
  loggedOn: string;
  createdAt: string;
}
