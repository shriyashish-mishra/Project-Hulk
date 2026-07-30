import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { ExerciseLibraryService } from '../services';
import type { ExerciseLibraryItem } from '../types';

export interface UseExerciseLibraryResult {
  exercises: ExerciseLibraryItem[];
  loading: boolean;
  refresh: () => void;
}

export function useExerciseLibrary(): UseExerciseLibraryResult {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ExerciseLibraryService.listAll(db).then((items) => {
      setExercises(items);
      setLoading(false);
    });
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { exercises, loading, refresh };
}
