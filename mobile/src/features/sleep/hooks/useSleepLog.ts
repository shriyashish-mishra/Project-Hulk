import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { SleepService, type SleepInput } from '../services';
import type { SleepLog } from '../types';

export interface UseSleepLogResult {
  sleepLog: SleepLog | null;
  loading: boolean;
  saveSleep: (input: SleepInput) => Promise<void>;
  /** Re-fetches without a fresh mount — for callers whose data was changed by a sibling component, like a sheet opened from Home. */
  refresh: () => void;
}

export function useSleepLog(date: string = getTodayDateString()): UseSleepLogResult {
  const db = useSQLiteContext();
  const [sleepLog, setSleepLog] = useState<SleepLog | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    SleepService.getSleepForDate(db, date).then((log) => {
      setSleepLog(log);
      setLoading(false);
    });
  }, [db, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSleep = useCallback(
    async (input: SleepInput) => {
      const saved = await SleepService.saveSleep(db, date, input);
      setSleepLog(saved);
    },
    [db, date],
  );

  return { sleepLog, loading, saveSleep, refresh };
}
