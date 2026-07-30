import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExerciseCategory, WeightUnit } from '@/features/exercise-library/types';
import type {
  SessionExercise,
  SessionExerciseInput,
  SessionExerciseUpdate,
  WorkoutSession,
  WorkoutSessionWithExercises,
} from '../types';

interface WorkoutSessionRow {
  id: number;
  template_id: number | null;
  template_name_snapshot: string;
  logged_on: string;
  started_at: string;
  completed_at: string | null;
  total_calories: number | null;
  created_at: string;
}

interface SessionExerciseRow {
  id: number;
  session_id: number;
  exercise_id: number;
  exercise_name: string;
  exercise_category: string;
  position: number;
  sets_planned: number | null;
  sets_completed: number;
  reps: number | null;
  weight: number | null;
  weight_unit: string | null;
  duration_minutes: number | null;
  incline_percent: number | null;
  speed_kph: number | null;
  notes: string | null;
}

function mapSessionRow(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    templateId: row.template_id,
    templateNameSnapshot: row.template_name_snapshot,
    loggedOn: row.logged_on,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    totalCalories: row.total_calories,
    createdAt: row.created_at,
  };
}

function mapExerciseRow(row: SessionExerciseRow): SessionExercise {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    category: row.exercise_category as ExerciseCategory,
    position: row.position,
    setsPlanned: row.sets_planned,
    setsCompleted: row.sets_completed,
    reps: row.reps,
    weight: row.weight,
    weightUnit: row.weight_unit as WeightUnit | null,
    durationMinutes: row.duration_minutes,
    inclinePercent: row.incline_percent,
    speedKph: row.speed_kph,
    notes: row.notes,
  };
}

const EXERCISE_SELECT = `
  SELECT se.*, el.name AS exercise_name, el.category AS exercise_category
  FROM workout_session_exercises se
  JOIN exercise_library el ON el.id = se.exercise_id
`;

export async function createSession(
  db: SQLiteDatabase,
  input: { templateId: number | null; templateNameSnapshot: string; loggedOn: string },
): Promise<WorkoutSession> {
  const result = await db.runAsync(
    'INSERT INTO workout_sessions (template_id, template_name_snapshot, logged_on) VALUES (?, ?, ?)',
    input.templateId,
    input.templateNameSnapshot,
    input.loggedOn,
  );
  const row = await db.getFirstAsync<WorkoutSessionRow>(
    'SELECT * FROM workout_sessions WHERE id = ?',
    result.lastInsertRowId,
  );
  if (!row) throw new Error('createSession: row missing immediately after insert');
  return mapSessionRow(row);
}

export async function addSessionExercise(
  db: SQLiteDatabase,
  sessionId: number,
  exerciseId: number,
  position: number,
  input: SessionExerciseInput,
): Promise<SessionExercise> {
  const result = await db.runAsync(
    `INSERT INTO workout_session_exercises (
      session_id, exercise_id, position, sets_planned, sets_completed, reps, weight,
      weight_unit, duration_minutes, incline_percent, speed_kph, notes
    ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
    sessionId,
    exerciseId,
    position,
    input.setsPlanned,
    input.reps,
    input.weight,
    input.weightUnit,
    input.durationMinutes,
    input.inclinePercent,
    input.speedKph,
    input.notes,
  );
  const row = await db.getFirstAsync<SessionExerciseRow>(
    `${EXERCISE_SELECT} WHERE se.id = ?`,
    result.lastInsertRowId,
  );
  if (!row) throw new Error('addSessionExercise: row missing immediately after insert');
  return mapExerciseRow(row);
}

export async function getSessionWithExercises(
  db: SQLiteDatabase,
  sessionId: number,
): Promise<WorkoutSessionWithExercises | null> {
  const row = await db.getFirstAsync<WorkoutSessionRow>('SELECT * FROM workout_sessions WHERE id = ?', sessionId);
  if (!row) return null;
  const exerciseRows = await db.getAllAsync<SessionExerciseRow>(
    `${EXERCISE_SELECT} WHERE se.session_id = ? ORDER BY se.position ASC`,
    sessionId,
  );
  return { ...mapSessionRow(row), exercises: exerciseRows.map(mapExerciseRow) };
}

const UPDATABLE_COLUMNS: Record<keyof SessionExerciseUpdate, string> = {
  weight: 'weight',
  weightUnit: 'weight_unit',
  reps: 'reps',
  setsCompleted: 'sets_completed',
  durationMinutes: 'duration_minutes',
  inclinePercent: 'incline_percent',
  speedKph: 'speed_kph',
};

/** Builds the `SET` clause from whichever fields are present — the edit sheet sends weight+reps or duration+incline+speed, `toggleSet` sends setsCompleted alone. */
export async function updateSessionExercise(
  db: SQLiteDatabase,
  sessionExerciseId: number,
  updates: SessionExerciseUpdate,
): Promise<SessionExercise> {
  const entries = Object.entries(updates) as [keyof SessionExerciseUpdate, string | number | null | undefined][];
  const present = entries.filter(([, value]) => value !== undefined);

  if (present.length > 0) {
    const setClause = present.map(([key]) => `${UPDATABLE_COLUMNS[key]} = ?`).join(', ');
    const values = present.map(([, value]) => value ?? null);
    await db.runAsync(
      `UPDATE workout_session_exercises SET ${setClause} WHERE id = ?`,
      ...values,
      sessionExerciseId,
    );
  }

  const row = await db.getFirstAsync<SessionExerciseRow>(`${EXERCISE_SELECT} WHERE se.id = ?`, sessionExerciseId);
  if (!row) throw new Error('updateSessionExercise: row missing after update');
  return mapExerciseRow(row);
}

export async function completeSession(
  db: SQLiteDatabase,
  sessionId: number,
  totalCalories: number,
): Promise<WorkoutSession> {
  await db.runAsync(
    `UPDATE workout_sessions SET completed_at = datetime('now'), total_calories = ? WHERE id = ?`,
    totalCalories,
    sessionId,
  );
  const row = await db.getFirstAsync<WorkoutSessionRow>('SELECT * FROM workout_sessions WHERE id = ?', sessionId);
  if (!row) throw new Error('completeSession: row missing after update');
  return mapSessionRow(row);
}
