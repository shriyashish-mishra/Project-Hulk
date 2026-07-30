import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExerciseCategory, WeightUnit } from '@/features/exercise-library/types';
import type {
  TemplateExercise,
  TemplateExerciseInput,
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
} from '../types';

interface WorkoutTemplateRow {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface TemplateExerciseRow {
  id: number;
  template_id: number;
  exercise_id: number;
  exercise_name: string;
  exercise_category: string;
  position: number;
  default_sets: number | null;
  default_reps: number | null;
  default_weight: number | null;
  default_weight_unit: string | null;
  default_rest_seconds: number | null;
  default_duration_minutes: number | null;
  default_incline_percent: number | null;
  default_speed_kph: number | null;
  notes: string | null;
}

function mapTemplateRow(row: WorkoutTemplateRow): WorkoutTemplate {
  return { id: row.id, name: row.name, createdAt: row.created_at, updatedAt: row.updated_at };
}

function mapExerciseRow(row: TemplateExerciseRow): TemplateExercise {
  return {
    id: row.id,
    templateId: row.template_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    category: row.exercise_category as ExerciseCategory,
    position: row.position,
    defaultSets: row.default_sets,
    defaultReps: row.default_reps,
    defaultWeight: row.default_weight,
    defaultWeightUnit: row.default_weight_unit as WeightUnit | null,
    defaultRestSeconds: row.default_rest_seconds,
    defaultDurationMinutes: row.default_duration_minutes,
    defaultInclinePercent: row.default_incline_percent,
    defaultSpeedKph: row.default_speed_kph,
    notes: row.notes,
  };
}

const EXERCISE_SELECT = `
  SELECT te.*, el.name AS exercise_name, el.category AS exercise_category
  FROM template_exercises te
  JOIN exercise_library el ON el.id = te.exercise_id
`;

export async function listTemplates(db: SQLiteDatabase): Promise<WorkoutTemplate[]> {
  const rows = await db.getAllAsync<WorkoutTemplateRow>(
    'SELECT * FROM workout_templates ORDER BY updated_at DESC',
  );
  return rows.map(mapTemplateRow);
}

async function getExercisesForTemplate(db: SQLiteDatabase, templateId: number): Promise<TemplateExercise[]> {
  const rows = await db.getAllAsync<TemplateExerciseRow>(
    `${EXERCISE_SELECT} WHERE te.template_id = ? ORDER BY te.position ASC`,
    templateId,
  );
  return rows.map(mapExerciseRow);
}

export async function getTemplateWithExercises(
  db: SQLiteDatabase,
  templateId: number,
): Promise<WorkoutTemplateWithExercises | null> {
  const row = await db.getFirstAsync<WorkoutTemplateRow>(
    'SELECT * FROM workout_templates WHERE id = ?',
    templateId,
  );
  if (!row) return null;
  const exercises = await getExercisesForTemplate(db, templateId);
  return { ...mapTemplateRow(row), exercises };
}

export async function createTemplate(db: SQLiteDatabase, name: string): Promise<WorkoutTemplate> {
  const result = await db.runAsync('INSERT INTO workout_templates (name) VALUES (?)', name.trim());
  const row = await db.getFirstAsync<WorkoutTemplateRow>(
    'SELECT * FROM workout_templates WHERE id = ?',
    result.lastInsertRowId,
  );
  if (!row) throw new Error('createTemplate: row missing immediately after insert');
  return mapTemplateRow(row);
}

export async function renameTemplate(db: SQLiteDatabase, templateId: number, name: string): Promise<void> {
  await db.runAsync(
    `UPDATE workout_templates SET name = ?, updated_at = datetime('now') WHERE id = ?`,
    name.trim(),
    templateId,
  );
}

export async function deleteTemplate(db: SQLiteDatabase, templateId: number): Promise<void> {
  await db.runAsync('DELETE FROM workout_templates WHERE id = ?', templateId);
}

async function touchTemplate(db: SQLiteDatabase, templateId: number): Promise<void> {
  await db.runAsync(`UPDATE workout_templates SET updated_at = datetime('now') WHERE id = ?`, templateId);
}

export async function addTemplateExercise(
  db: SQLiteDatabase,
  templateId: number,
  exerciseId: number,
  input: TemplateExerciseInput,
): Promise<TemplateExercise> {
  const result = await db.runAsync(
    `INSERT INTO template_exercises (
      template_id, exercise_id, position, default_sets, default_reps, default_weight,
      default_weight_unit, default_rest_seconds, default_duration_minutes,
      default_incline_percent, default_speed_kph, notes
    ) VALUES (
      ?, ?, (SELECT COALESCE(MAX(position) + 1, 0) FROM template_exercises WHERE template_id = ?),
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )`,
    templateId,
    exerciseId,
    templateId,
    input.defaultSets,
    input.defaultReps,
    input.defaultWeight,
    input.defaultWeightUnit,
    input.defaultRestSeconds,
    input.defaultDurationMinutes,
    input.defaultInclinePercent,
    input.defaultSpeedKph,
    input.notes,
  );
  await touchTemplate(db, templateId);
  const row = await db.getFirstAsync<TemplateExerciseRow>(
    `${EXERCISE_SELECT} WHERE te.id = ?`,
    result.lastInsertRowId,
  );
  if (!row) throw new Error('addTemplateExercise: row missing immediately after insert');
  return mapExerciseRow(row);
}

export async function updateTemplateExercise(
  db: SQLiteDatabase,
  templateExerciseId: number,
  input: TemplateExerciseInput,
): Promise<TemplateExercise> {
  await db.runAsync(
    `UPDATE template_exercises SET
      default_sets = ?, default_reps = ?, default_weight = ?, default_weight_unit = ?,
      default_rest_seconds = ?, default_duration_minutes = ?, default_incline_percent = ?,
      default_speed_kph = ?, notes = ?
    WHERE id = ?`,
    input.defaultSets,
    input.defaultReps,
    input.defaultWeight,
    input.defaultWeightUnit,
    input.defaultRestSeconds,
    input.defaultDurationMinutes,
    input.defaultInclinePercent,
    input.defaultSpeedKph,
    input.notes,
    templateExerciseId,
  );
  const row = await db.getFirstAsync<TemplateExerciseRow>(`${EXERCISE_SELECT} WHERE te.id = ?`, templateExerciseId);
  if (!row) throw new Error('updateTemplateExercise: row missing after update');
  await touchTemplate(db, row.template_id);
  return mapExerciseRow(row);
}

export async function removeTemplateExercise(db: SQLiteDatabase, templateExerciseId: number): Promise<void> {
  const row = await db.getFirstAsync<{ template_id: number }>(
    'SELECT template_id FROM template_exercises WHERE id = ?',
    templateExerciseId,
  );
  await db.runAsync('DELETE FROM template_exercises WHERE id = ?', templateExerciseId);
  if (row) await touchTemplate(db, row.template_id);
}

/**
 * Swaps this exercise's `position` with its immediate neighbor — a no-op
 * (not an error) if it's already at that edge of the list. `position`
 * values aren't unique-constrained, so a simple two-row swap is safe
 * without a transaction wrapper (matches the rest of this app's
 * repositories, none of which use one).
 */
export async function moveTemplateExercise(
  db: SQLiteDatabase,
  templateId: number,
  templateExerciseId: number,
  direction: 'up' | 'down',
): Promise<void> {
  const ordered = await db.getAllAsync<{ id: number; position: number }>(
    'SELECT id, position FROM template_exercises WHERE template_id = ? ORDER BY position ASC',
    templateId,
  );
  const index = ordered.findIndex((row) => row.id === templateExerciseId);
  const neighborIndex = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || neighborIndex < 0 || neighborIndex >= ordered.length) return;

  const current = ordered[index];
  const neighbor = ordered[neighborIndex];
  await db.runAsync('UPDATE template_exercises SET position = ? WHERE id = ?', neighbor.position, current.id);
  await db.runAsync('UPDATE template_exercises SET position = ? WHERE id = ?', current.position, neighbor.id);
  await touchTemplate(db, templateId);
}
