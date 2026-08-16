import type { ExerciseCategory, WeightUnit } from "@/lib/exercise-library/types";

/** The per-field defaults a template stores for one exercise — what starting a session pre-fills from. */
export interface TemplateExerciseInput {
  default_sets: number | null;
  default_reps: number | null;
  default_weight: number | null;
  default_weight_unit: WeightUnit | null;
  default_rest_seconds: number | null;
  default_duration_minutes: number | null;
  default_incline_percent: number | null;
  default_speed_kph: number | null;
  notes: string | null;
}

export interface TemplateExercise extends TemplateExerciseInput {
  id: string;
  template_id: string;
  exercise_id: string;
  exercise_name: string;
  category: ExerciseCategory;
  position: number;
  /** The exercise library's cached MET classification, joined in for `startSessionFromTemplate`'s background classification pass — see exercise-library/met.ts. Null until classified. */
  met_value: number | null;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: TemplateExercise[];
}
