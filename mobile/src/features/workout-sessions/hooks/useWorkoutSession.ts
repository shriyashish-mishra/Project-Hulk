import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { WorkoutProgressService } from '@/features/workout-progress/services';
import type { SessionWeightSuggestion } from '@/features/workout-progress/types';
import { WorkoutSessionService } from '../services';
import type { SessionExercise, SessionExerciseUpdate, WorkoutSessionWithExercises } from '../types';

export interface UseWorkoutSessionResult {
  session: WorkoutSessionWithExercises | null;
  loading: boolean;
  elapsedMinutes: number;
  estimatedCalories: number;
  exercisesCompletedCount: number;
  /** Keyed by session_exercise id — flags exercises whose pre-filled weight already reflects a Hulk-computed bump/ease from the last time this template was completed. */
  weightSuggestions: Record<number, SessionWeightSuggestion>;
  updateExercise: (exercise: SessionExercise, updates: SessionExerciseUpdate) => Promise<void>;
  toggleSet: (exercise: SessionExercise, setIndex: number) => Promise<void>;
  complete: () => Promise<void>;
  completing: boolean;
}

/** `started_at` is a SQLite `datetime('now')` string — UTC, space-separated — so it needs the `T`/`Z` normalization below before `Date` will parse it correctly. */
function parseSqliteUtc(value: string): number {
  return new Date(`${value.replace(' ', 'T')}Z`).getTime();
}

/** Backs the Active Workout Session screen: live elapsed time, a live calorie estimate, and every mutation the exercise cards can trigger. */
export function useWorkoutSession(sessionId: number): UseWorkoutSessionResult {
  const db = useSQLiteContext();
  const [session, setSession] = useState<WorkoutSessionWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [weightSuggestions, setWeightSuggestions] = useState<Record<number, SessionWeightSuggestion>>({});

  const refresh = useCallback(() => {
    WorkoutSessionService.getSession(db, sessionId).then(async (result) => {
      setSession(result);
      setLoading(false);
      // Only meaningful while still in progress — once completed, the
      // weight shown is history, not a suggestion.
      setWeightSuggestions(result && !result.completedAt ? await WorkoutProgressService.getSessionWeightSuggestions(db, result) : {});
    });
  }, [db, sessionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!session || session.completedAt) return;
    const startedAtMs = parseSqliteUtc(session.startedAt);

    function tick() {
      setElapsedMinutes(Math.max(0, Math.round((Date.now() - startedAtMs) / 60000)));
    }
    tick();
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, [session]);

  const updateExercise = useCallback(
    async (exercise: SessionExercise, updates: SessionExerciseUpdate) => {
      await WorkoutSessionService.updateExercise(db, exercise.id, updates);
      refresh();
    },
    [db, refresh],
  );

  const toggleSet = useCallback(
    async (exercise: SessionExercise, setIndex: number) => {
      await WorkoutSessionService.toggleSet(db, exercise, setIndex);
      refresh();
    },
    [db, refresh],
  );

  const complete = useCallback(async () => {
    if (!session) return;
    setCompleting(true);
    try {
      await WorkoutSessionService.completeWorkout(db, session, Math.max(1, elapsedMinutes));
    } finally {
      setCompleting(false);
    }
  }, [db, session, elapsedMinutes]);

  const exercisesCompletedCount = session
    ? session.exercises.filter((exercise) =>
        exercise.category === 'cardio'
          ? exercise.setsCompleted > 0
          : exercise.setsPlanned != null && exercise.setsCompleted >= exercise.setsPlanned,
      ).length
    : 0;

  const estimatedCalories = session ? WorkoutSessionService.estimateCalories(session.exercises) : 0;

  return {
    session,
    loading,
    elapsedMinutes,
    estimatedCalories,
    exercisesCompletedCount,
    weightSuggestions,
    updateExercise,
    toggleSet,
    complete,
    completing,
  };
}
