import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { FoodService, type MealsByType } from '../services';
import type { MealType } from '../types';

export interface UseFoodLogResult {
  mealsByType: MealsByType | null;
  loading: boolean;
  saveMeal: (mealType: MealType, rawText: string) => Promise<void>;
  deleteMeal: (mealType: MealType) => Promise<void>;
}

/** Powers the Food sheet — all four meal slots for a date, grouped, with save/delete actions that refresh themselves. */
export function useFoodLog(date: string = getTodayDateString()): UseFoodLogResult {
  const db = useSQLiteContext();
  const [mealsByType, setMealsByType] = useState<MealsByType | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    FoodService.getMealsForDate(db, date).then((result) => {
      setMealsByType(result);
      setLoading(false);
    });
  }, [db, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveMeal = useCallback(
    async (mealType: MealType, rawText: string) => {
      await FoodService.saveMeal(db, date, mealType, rawText);
      refresh();
    },
    [db, date, refresh],
  );

  const deleteMeal = useCallback(
    async (mealType: MealType) => {
      await FoodService.deleteMeal(db, date, mealType);
      refresh();
    },
    [db, date, refresh],
  );

  return { mealsByType, loading, saveMeal, deleteMeal };
}
