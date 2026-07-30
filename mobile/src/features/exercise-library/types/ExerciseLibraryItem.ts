export type ExerciseCategory = 'strength' | 'cardio';
export type WeightUnit = 'kg' | 'lbs';

/** The reusable exercise catalog templates and sessions both point at — grows organically as new names get typed rather than being pre-populated exhaustively. */
export interface ExerciseLibraryItem {
  id: number;
  name: string;
  category: ExerciseCategory;
  defaultUnit: WeightUnit;
  createdAt: string;
}
