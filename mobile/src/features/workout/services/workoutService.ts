import type { SQLiteDatabase } from 'expo-sqlite';

import { getWorkoutLogForDate, upsertWorkoutLog } from '../repository';
import type { WorkoutLog } from '../types';

export interface WorkoutInput {
  workoutType: string | null;
  durationMinutes: number | null;
  notes: string;
}

/** Workout's business logic — "completed" is just "a row exists for the date," so there's nothing to derive beyond that yet. */
export const WorkoutService = {
  async getWorkoutForDate(db: SQLiteDatabase, date: string): Promise<WorkoutLog | null> {
    return getWorkoutLogForDate(db, date);
  },

  /** Won't save a workout with nothing in it — an untouched form shouldn't create a "completed" entry. */
  async saveWorkout(db: SQLiteDatabase, date: string, input: WorkoutInput): Promise<WorkoutLog | null> {
    const hasContent = Boolean(input.workoutType?.trim()) || input.durationMinutes !== null || input.notes.trim().length > 0;
    if (!hasContent) {
      return null;
    }
    return upsertWorkoutLog(db, date, input.workoutType?.trim() || null, input.durationMinutes, input.notes.trim());
  },
};
