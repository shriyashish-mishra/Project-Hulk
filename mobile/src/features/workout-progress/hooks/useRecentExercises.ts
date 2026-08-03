import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { WorkoutProgressService } from '../services';
import type { RecentExercise } from '../types';

export interface UseRecentExercisesResult {
  exercises: RecentExercise[];
  loading: boolean;
}

/** Every strength exercise ever completed, most recently trained first — powers the Progress tab's exercise picker strip. */
export function useRecentExercises(): UseRecentExercisesResult {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<RecentExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    WorkoutProgressService.getRecentExercises(db).then((result) => {
      if (!cancelled) {
        setExercises(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  return { exercises, loading };
}
