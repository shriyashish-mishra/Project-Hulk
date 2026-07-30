import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { WeightService } from '../services';
import type { WeightLog } from '../types';

export interface UseWeightLogResult {
  latestWeightLog: WeightLog | null;
  loading: boolean;
  saveWeight: (weightKg: number) => Promise<void>;
}

/** The most recent weigh-in (weight isn't logged daily), plus a quick action to log today's. */
export function useWeightLog(): UseWeightLogResult {
  const db = useSQLiteContext();
  const [latestWeightLog, setLatestWeightLog] = useState<WeightLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    WeightService.getLatest(db).then((log) => {
      if (!cancelled) {
        setLatestWeightLog(log);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const saveWeight = useCallback(
    async (weightKg: number) => {
      const updated = await WeightService.saveWeight(db, getTodayDateString(), weightKg);
      setLatestWeightLog(updated);
    },
    [db],
  );

  return { latestWeightLog, loading, saveWeight };
}
