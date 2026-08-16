import type { ExerciseCategory, WeightUnit } from "@/lib/exercise-library/types";

/** What a template exercise's defaults get copied into when a session starts. */
export interface SessionExerciseInput {
  sets_planned: number | null;
  reps: number | null;
  weight: number | null;
  weight_unit: WeightUnit | null;
  duration_minutes: number | null;
  incline_percent: number | null;
  speed_kph: number | null;
  notes: string | null;
}

/** Any subset of a session exercise's live, editable fields — the edit drawer updates weight/reps/sets or duration/incline/speed, and toggling a set updates `sets_completed` alone. */
export interface SessionExerciseUpdate {
  weight?: number | null;
  weight_unit?: WeightUnit | null;
  reps?: number | null;
  sets_planned?: number | null;
  sets_completed?: number;
  duration_minutes?: number | null;
  incline_percent?: number | null;
  speed_kph?: number | null;
}

export interface SessionExercise extends SessionExerciseInput {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  category: ExerciseCategory;
  position: number;
  sets_completed: number;
  /** The exercise library's cached MET classification, joined in for the calorie estimate — see estimate.ts and exercise-library/met.ts. Null until classified. */
  met_value: number | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  template_id: string | null;
  template_name_snapshot: string;
  logged_on: string;
  started_at: string;
  completed_at: string | null;
  total_calories: number | null;
  created_at: string;
}

export interface WorkoutSessionWithExercises extends WorkoutSession {
  exercises: SessionExercise[];
}
