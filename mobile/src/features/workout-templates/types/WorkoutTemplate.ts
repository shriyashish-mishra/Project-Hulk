import type { ExerciseCategory, WeightUnit } from '@/features/exercise-library/types';

/** The per-field defaults a template stores for one exercise — what the Active Session screen pre-fills from. */
export interface TemplateExerciseInput {
  defaultSets: number | null;
  defaultReps: number | null;
  defaultWeight: number | null;
  defaultWeightUnit: WeightUnit | null;
  defaultRestSeconds: number | null;
  defaultDurationMinutes: number | null;
  defaultInclinePercent: number | null;
  defaultSpeedKph: number | null;
  notes: string | null;
}

export interface TemplateExercise extends TemplateExerciseInput {
  id: number;
  templateId: number;
  exerciseId: number;
  exerciseName: string;
  category: ExerciseCategory;
  position: number;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: TemplateExercise[];
}
