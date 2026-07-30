import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { WaterService, type WaterSummary } from '../services';
import type { WaterEntry } from '../types';

export interface UseWaterLogResult {
  totalMl: number;
  goalMl: number;
  entries: WaterEntry[];
  loading: boolean;
  addWater: (amountMl: number) => Promise<void>;
  undoLast: () => Promise<void>;
  setGoal: (goalMl: number) => Promise<void>;
}

const EMPTY_SUMMARY: WaterSummary = { totalMl: 0, goalMl: 2000, entries: [] };

/** Today's water progress plus every action the Home widget and history sheet need — the water feature's only public hook. */
export function useWaterLog(date: string = getTodayDateString()): UseWaterLogResult {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<WaterSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    WaterService.getSummary(db, date).then((result) => {
      setSummary(result);
      setLoading(false);
    });
  }, [db, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addWater = useCallback(
    async (amountMl: number) => {
      await WaterService.addWater(db, date, amountMl);
      refresh();
    },
    [db, date, refresh],
  );

  const undoLast = useCallback(async () => {
    await WaterService.undoLast(db, date);
    refresh();
  }, [db, date, refresh]);

  const setGoal = useCallback(
    async (goalMl: number) => {
      await WaterService.setGoal(db, date, goalMl);
      refresh();
    },
    [db, date, refresh],
  );

  return {
    totalMl: summary.totalMl,
    goalMl: summary.goalMl,
    entries: summary.entries,
    loading,
    addWater,
    undoLast,
    setGoal,
  };
}
