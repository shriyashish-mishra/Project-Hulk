import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { getFoodLogsForDate } from '../repository';
import type { FoodLog } from '../types';

export interface UseTodayFoodLogsResult {
  foodLogs: FoodLog[];
  loading: boolean;
  /** Re-fetches without a fresh mount — for callers whose data was changed by a sibling component, like a sheet opened from Home. */
  refresh: () => void;
}

/** A date's logged meals — used by the home screen's "today's summary" to show how many of the day's meals are filled in. */
export function useTodayFoodLogs(date: string = getTodayDateString()): UseTodayFoodLogsResult {
  const db = useSQLiteContext();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    getFoodLogsForDate(db, date).then((logs) => {
      setFoodLogs(logs);
      setLoading(false);
    });
  }, [db, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { foodLogs, loading, refresh };
}
