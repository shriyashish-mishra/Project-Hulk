import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { WorkoutService } from '../services';
import type { WorkoutLog } from '../types';

export interface UseRecentWorkoutLogsResult {
  workoutLogs: WorkoutLog[];
  loading: boolean;
}

/** Powers the Workouts hub's "Recent Workouts" section — the simple daily log, not template-based sessions. */
export function useRecentWorkoutLogs(): UseRecentWorkoutLogsResult {
  const db = useSQLiteContext();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    WorkoutService.getRecentWorkouts(db).then((logs) => {
      setWorkoutLogs(logs);
      setLoading(false);
    });
  }, [db]);

  return { workoutLogs, loading };
}
