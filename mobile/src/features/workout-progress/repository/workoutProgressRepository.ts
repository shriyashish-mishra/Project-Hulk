import type { SQLiteDatabase } from 'expo-sqlite';

import type { WeightUnit } from '@/features/exercise-library/types';
import type { WorkoutSession } from '@/features/workout-sessions/types';
import type { ExerciseHistoryEntry, RecentExercise } from '../types';

interface RecentExerciseRow {
  exercise_id: number;
  name: string;
  default_unit: WeightUnit;
  last_completed_at: string;
}

interface ExerciseHistoryRow {
  session_id: number;
  completed_at: string;
  weight: number | null;
  weight_unit: WeightUnit | null;
  reps: number | null;
  sets_completed: number;
  sets_planned: number | null;
}

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

function mapRecentExerciseRow(row: RecentExerciseRow): RecentExercise {
  return {
    exerciseId: row.exercise_id,
    name: row.name,
    defaultUnit: row.default_unit,
    lastCompletedAt: row.last_completed_at,
  };
}

function mapHistoryRow(row: ExerciseHistoryRow): ExerciseHistoryEntry {
  return {
    sessionId: row.session_id,
    completedAt: row.completed_at,
    weight: row.weight,
    weightUnit: row.weight_unit,
    reps: row.reps,
    setsCompleted: row.sets_completed,
    setsPlanned: row.sets_planned,
  };
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

/** Every distinct strength exercise ever completed, most recently trained first — deliberately unbounded, not a top-N recent list, so a user's full history is always browsable. */
export async function getRecentlyTrainedExercises(db: SQLiteDatabase): Promise<RecentExercise[]> {
  const rows = await db.getAllAsync<RecentExerciseRow>(`
    SELECT el.id AS exercise_id, el.name, el.default_unit, MAX(ws.completed_at) AS last_completed_at
    FROM workout_session_exercises se
    JOIN workout_sessions ws ON ws.id = se.session_id
    JOIN exercise_library el ON el.id = se.exercise_id
    WHERE ws.completed_at IS NOT NULL AND el.category = 'strength'
    GROUP BY el.id
    ORDER BY last_completed_at DESC
  `);
  return rows.map(mapRecentExerciseRow);
}

const EXERCISE_HISTORY_LIMIT = 100;

/** One exercise's full completed-session history, newest first — 100 comfortably covers months of even frequent training. */
export async function getExerciseSessionHistory(
  db: SQLiteDatabase,
  exerciseId: number,
): Promise<ExerciseHistoryEntry[]> {
  const rows = await db.getAllAsync<ExerciseHistoryRow>(
    `SELECT se.session_id, ws.completed_at, se.weight, se.weight_unit, se.reps, se.sets_completed, se.sets_planned
     FROM workout_session_exercises se
     JOIN workout_sessions ws ON ws.id = se.session_id
     WHERE se.exercise_id = ? AND ws.completed_at IS NOT NULL
     ORDER BY ws.completed_at DESC
     LIMIT ?`,
    exerciseId,
    EXERCISE_HISTORY_LIMIT,
  );
  return rows.map(mapHistoryRow);
}

const COMPLETED_SESSIONS_LIMIT = 100;

/** Every completed session, newest first — backs the Workouts "History" tab. */
export async function getCompletedSessions(db: SQLiteDatabase): Promise<WorkoutSession[]> {
  const rows = await db.getAllAsync<WorkoutSessionRow>(
    'SELECT * FROM workout_sessions WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT ?',
    COMPLETED_SESSIONS_LIMIT,
  );
  return rows.map(mapSessionRow);
}
