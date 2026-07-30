import type { SQLiteDatabase } from 'expo-sqlite';

import { createExercise, findExerciseByName, listExercises } from '../repository';
import type { ExerciseCategory, ExerciseLibraryItem, WeightUnit } from '../types';

export const ExerciseLibraryService = {
  async listAll(db: SQLiteDatabase): Promise<ExerciseLibraryItem[]> {
    return listExercises(db);
  },

  /** Finds an existing exercise by name (case-insensitive) or creates one — same "the catalog grows as you type" principle as the web app's workout presets. */
  async findOrCreate(
    db: SQLiteDatabase,
    name: string,
    category: ExerciseCategory,
    defaultUnit: WeightUnit,
  ): Promise<ExerciseLibraryItem> {
    const existing = await findExerciseByName(db, name);
    if (existing) return existing;
    return createExercise(db, name, category, defaultUnit);
  },
};
