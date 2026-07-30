import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { WeightService, type WeightHistoryWithTrend } from '../services';

export interface UseWeightHistoryResult extends WeightHistoryWithTrend {
  loading: boolean;
}

/** Powers the weight history sheet — a bounded list plus a simple trend, nothing more. */
export function useWeightHistory(): UseWeightHistoryResult {
  const db = useSQLiteContext();
  const [result, setResult] = useState<WeightHistoryWithTrend>({ history: [], trend: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    WeightService.getHistoryWithTrend(db).then((value) => {
      if (!cancelled) {
        setResult(value);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  return { history: result.history, trend: result.trend, loading };
}
