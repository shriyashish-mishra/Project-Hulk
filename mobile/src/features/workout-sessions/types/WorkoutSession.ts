import type { ExerciseCategory, WeightUnit } from '@/features/exercise-library/types';

/** What a template exercise's defaults get copied into when a session starts. */
export interface SessionExerciseInput {
  setsPlanned: number | null;
  reps: number | null;
  weight: number | null;
  weightUnit: WeightUnit | null;
  durationMinutes: number | null;
  inclinePercent: number | null;
  speedKph: number | null;
  notes: string | null;
}

/** Any subset of a session exercise's live, editable fields — the edit sheet updates weight/reps or duration/incline/speed, and `toggleSet` updates `setsCompleted` alone. */
export interface SessionExerciseUpdate {
  weight?: number | null;
  weightUnit?: WeightUnit | null;
  reps?: number | null;
  setsCompleted?: number;
  durationMinutes?: number | null;
  inclinePercent?: number | null;
  speedKph?: number | null;
}

export interface SessionExercise extends SessionExerciseInput {
  id: number;
  sessionId: number;
  exerciseId: number;
  exerciseName: string;
  category: ExerciseCategory;
  position: number;
  setsCompleted: number;
}

export interface WorkoutSession {
  id: number;
  templateId: number | null;
  templateNameSnapshot: string;
  loggedOn: string;
  startedAt: string;
  completedAt: string | null;
  totalCalories: number | null;
  createdAt: string;
}

export interface WorkoutSessionWithExercises extends WorkoutSession {
  exercises: SessionExercise[];
}
