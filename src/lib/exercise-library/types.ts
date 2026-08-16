export type ExerciseCategory = "strength" | "cardio";
export type WeightUnit = "kg" | "lbs";

/** The reusable exercise catalog templates and sessions both point at — grows organically as new names get typed rather than being pre-populated exhaustively. */
export interface ExerciseLibraryItem {
  id: string;
  user_id: string;
  name: string;
  category: ExerciseCategory;
  default_unit: WeightUnit;
  /** Cached MET (Metabolic Equivalent of Task) classification for the calorie estimate — null until first classified. See exercise-library/met.ts. */
  met_value: number | null;
  created_at: string;
}
