import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { WeightService } from '../services';
import type { WeightLog } from '../types';

export interface UseWeightLogResult {
  /** The entry for this exact date, or `null` if that day has none. */
  weightLog: WeightLog | null;
  loading: boolean;
  saveWeight: (weightKg: number) => Promise<void>;
  /** Re-fetches without a fresh mount — for a sibling `WeightSheet` instance (its own hook instance) that just saved a weigh-in this caller needs to reflect. */
  refresh: () => void;
}

/** Backs the Journal dashboard's Weight row — one specific date's entry, same shape and date-parameterization as `useSleepLog`/`useFoodLog`. */
export function useWeightLog(date: string = getTodayDateString()): UseWeightLogResult {
  const db = useSQLiteContext();
  const [weightLog, setWeightLog] = useState<WeightLog | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    WeightService.getForDate(db, date).then((log) => {
      setWeightLog(log);
      setLoading(false);
    });
  }, [db, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveWeight = useCallback(
    async (weightKg: number) => {
      const saved = await WeightService.saveWeight(db, date, weightKg);
      setWeightLog(saved);
    },
    [db, date],
  );

  return { weightLog, loading, saveWeight, refresh };
}
