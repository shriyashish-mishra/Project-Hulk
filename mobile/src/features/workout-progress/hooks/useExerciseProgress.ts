import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { WorkoutProgressService } from '../services';
import type { ExerciseProgressSummary, RecentExercise } from '../types';

export interface UseExerciseProgressResult {
  summary: ExerciseProgressSummary | null;
  loading: boolean;
  refresh: () => void;
}

/** One exercise's full progression summary — trend, PRs, recommendation, insight — recomputed whenever the selected exercise changes. */
export function useExerciseProgress(exercise: RecentExercise | null): UseExerciseProgressResult {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<ExerciseProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!exercise) {
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    WorkoutProgressService.getExerciseSummary(db, exercise).then((result) => {
      setSummary(result);
      setLoading(false);
    });
  }, [db, exercise]);

  useEffect(() => {
    // Mirrors React's own documented data-fetching effect (reset, then set
    // again from the async callback once it resolves).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return { summary, loading, refresh };
}
