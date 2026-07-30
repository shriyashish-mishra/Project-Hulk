import type { SQLiteDatabase } from 'expo-sqlite';

import { deleteFoodLog, getFoodLogsForDate, upsertFoodLog } from '../repository';
import { MEAL_TYPES } from '../types';
import type { FoodLog, MealType } from '../types';

export type MealsByType = Record<MealType, FoodLog | null>;

/**
 * Food's business logic — hooks call this, never the repository directly.
 * Owns what "grouped by meal type" means and the rule that an emptied-out
 * note is a deletion, not a saved blank entry.
 */
export const FoodService = {
  /** Groups a date's meals by type — `null` for any meal not yet logged, so the UI never has to search an array to ask "is breakfast logged?" */
  async getMealsForDate(db: SQLiteDatabase, date: string): Promise<MealsByType> {
    const logs = await getFoodLogsForDate(db, date);
    const byType = Object.fromEntries(MEAL_TYPES.map((type) => [type, null])) as MealsByType;
    for (const log of logs) {
      byType[log.mealType] = log;
    }
    return byType;
  },

  /** Clearing a meal's text deletes it rather than saving an empty note — an empty meal isn't a meal. */
  async saveMeal(db: SQLiteDatabase, date: string, mealType: MealType, rawText: string): Promise<FoodLog | null> {
    const trimmed = rawText.trim();
    if (trimmed.length === 0) {
      await deleteFoodLog(db, date, mealType);
      return null;
    }
    return upsertFoodLog(db, date, mealType, trimmed);
  },

  async deleteMeal(db: SQLiteDatabase, date: string, mealType: MealType): Promise<void> {
    await deleteFoodLog(db, date, mealType);
  },
};
