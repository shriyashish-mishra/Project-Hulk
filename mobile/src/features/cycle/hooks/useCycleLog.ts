import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { CycleService } from '../services';
import type { CycleLog } from '../types';

export interface UseCycleLogResult {
  activeLog: CycleLog | null;
  recentLogs: CycleLog[];
  loading: boolean;
  startPeriod: () => Promise<void>;
  endPeriod: () => Promise<void>;
  deletePeriod: (id: number) => Promise<void>;
}

/** Manual period logging — start/end only, no derived phase or prediction. */
export function useCycleLog(): UseCycleLogResult {
  const db = useSQLiteContext();
  const [activeLog, setActiveLog] = useState<CycleLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<CycleLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    Promise.all([CycleService.getActivePeriod(db), CycleService.getRecentPeriods(db)]).then(
      ([active, recent]) => {
        setActiveLog(active);
        setRecentLogs(recent);
        setLoading(false);
      },
    );
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startPeriod = useCallback(async () => {
    await CycleService.startPeriod(db, getTodayDateString());
    refresh();
  }, [db, refresh]);

  const endPeriod = useCallback(async () => {
    await CycleService.endPeriod(db, getTodayDateString());
    refresh();
  }, [db, refresh]);

  const deletePeriod = useCallback(
    async (id: number) => {
      await CycleService.deletePeriod(db, id);
      refresh();
    },
    [db, refresh],
  );

  return { activeLog, recentLogs, loading, startPeriod, endPeriod, deletePeriod };
}
