import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExerciseCategory, ExerciseLibraryItem, WeightUnit } from '../types';

interface ExerciseLibraryRow {
  id: number;
  name: string;
  category: string;
  default_unit: string;
  created_at: string;
}

function mapRow(row: ExerciseLibraryRow): ExerciseLibraryItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ExerciseCategory,
    defaultUnit: row.default_unit as WeightUnit,
    createdAt: row.created_at,
  };
}

export async function listExercises(db: SQLiteDatabase): Promise<ExerciseLibraryItem[]> {
  const rows = await db.getAllAsync<ExerciseLibraryRow>('SELECT * FROM exercise_library ORDER BY name ASC');
  return rows.map(mapRow);
}

export async function findExerciseByName(db: SQLiteDatabase, name: string): Promise<ExerciseLibraryItem | null> {
  const row = await db.getFirstAsync<ExerciseLibraryRow>(
    'SELECT * FROM exercise_library WHERE name = ? COLLATE NOCASE',
    name.trim(),
  );
  return row ? mapRow(row) : null;
}

export async function createExercise(
  db: SQLiteDatabase,
  name: string,
  category: ExerciseCategory,
  defaultUnit: WeightUnit,
): Promise<ExerciseLibraryItem> {
  const result = await db.runAsync(
    'INSERT INTO exercise_library (name, category, default_unit) VALUES (?, ?, ?)',
    name.trim(),
    category,
    defaultUnit,
  );
  const row = await db.getFirstAsync<ExerciseLibraryRow>(
    'SELECT * FROM exercise_library WHERE id = ?',
    result.lastInsertRowId,
  );
  if (!row) {
    throw new Error('createExercise: row missing immediately after insert');
  }
  return mapRow(row);
}
