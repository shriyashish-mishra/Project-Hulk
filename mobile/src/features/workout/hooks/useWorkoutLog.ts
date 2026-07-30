import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { WorkoutService, type WorkoutInput } from '../services';
import type { WorkoutLog } from '../types';

export interface UseWorkoutLogResult {
  workoutLog: WorkoutLog | null;
  loading: boolean;
  saveWorkout: (input: WorkoutInput) => Promise<void>;
  /** Re-fetches without a fresh mount — for callers whose data was changed by a sibling component, like a sheet opened from Home. */
  refresh: () => void;
}

export function useWorkoutLog(date: string = getTodayDateString()): UseWorkoutLogResult {
  const db = useSQLiteContext();
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    WorkoutService.getWorkoutForDate(db, date).then((log) => {
      setWorkoutLog(log);
      setLoading(false);
    });
  }, [db, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveWorkout = useCallback(
    async (input: WorkoutInput) => {
      const saved = await WorkoutService.saveWorkout(db, date, input);
      setWorkoutLog(saved);
    },
    [db, date],
  );

  return { workoutLog, loading, saveWorkout, refresh };
}
