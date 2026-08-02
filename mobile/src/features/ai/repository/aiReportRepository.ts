import type { SQLiteDatabase } from 'expo-sqlite';

import type { AIReport, AIReportContent, AIReportExercise } from '../types';

interface AIReportRow {
  id: number;
  report_date: string;
  context_version: string;
  prompt_version: string;
  summary: string;
  nutrition_score: number;
  activity_score: number;
  recovery_score: number;
  wins: string;
  improvements: string;
  nutrition_feedback: string;
  workout_feedback: string;
  recovery_feedback: string;
  tomorrow_suggestions: string;
  raw_response: string;
  created_at: string;
  estimated_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  calorie_balance_text: string | null;
  calorie_balance_kcal: number | null;
  muscles_trained: string | null;
  workout_duration_min: number | null;
  workout_calories_burned: number | null;
  workout_exercises: string | null;
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function parseExercises(value: string | null): AIReportExercise[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function mapRow(row: AIReportRow): AIReport {
  return {
    id: row.id,
    date: row.report_date,
    contextVersion: row.context_version,
    promptVersion: row.prompt_version,
    summary: row.summary,
    scores: {
      nutrition: row.nutrition_score,
      activity: row.activity_score,
      recovery: row.recovery_score,
    },
    wins: parseJsonArray(row.wins),
    improvements: parseJsonArray(row.improvements),
    nutritionFeedback: row.nutrition_feedback,
    workoutFeedback: row.workout_feedback,
    recoveryFeedback: row.recovery_feedback,
    tomorrowSuggestions: parseJsonArray(row.tomorrow_suggestions),
    rawResponse: row.raw_response,
    createdAt: row.created_at,
    estimatedCalories: row.estimated_calories ?? undefined,
    proteinG: row.protein_g ?? undefined,
    carbsG: row.carbs_g ?? undefined,
    fatG: row.fat_g ?? undefined,
    fiberG: row.fiber_g ?? undefined,
    calorieBalanceText: row.calorie_balance_text ?? undefined,
    calorieBalanceKcal: row.calorie_balance_kcal ?? undefined,
    musclesTrained: row.muscles_trained ? parseJsonArray(row.muscles_trained) : undefined,
    workoutDurationMin: row.workout_duration_min ?? undefined,
    workoutCaloriesBurned: row.workout_calories_burned ?? undefined,
    workoutExercises: parseExercises(row.workout_exercises),
  };
}

/** No UNIQUE(report_date) — regenerating a report for the same day adds a new row rather than overwriting history. */
export async function saveReport(
  db: SQLiteDatabase,
  date: string,
  contextVersion: string,
  promptVersion: string,
  content: AIReportContent,
): Promise<AIReport> {
  const result = await db.runAsync(
    `INSERT INTO ai_reports (
      report_date, context_version, prompt_version, summary,
      nutrition_score, activity_score, recovery_score,
      wins, improvements, nutrition_feedback, workout_feedback, recovery_feedback,
      tomorrow_suggestions, raw_response,
      estimated_calories, protein_g, carbs_g, fat_g, fiber_g,
      calorie_balance_text, calorie_balance_kcal, muscles_trained,
      workout_duration_min, workout_calories_burned, workout_exercises
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    date,
    contextVersion,
    promptVersion,
    content.summary,
    content.scores.nutrition,
    content.scores.activity,
    content.scores.recovery,
    JSON.stringify(content.wins),
    JSON.stringify(content.improvements),
    content.nutritionFeedback,
    content.workoutFeedback,
    content.recoveryFeedback,
    JSON.stringify(content.tomorrowSuggestions),
    content.rawResponse,
    content.estimatedCalories ?? null,
    content.proteinG ?? null,
    content.carbsG ?? null,
    content.fatG ?? null,
    content.fiberG ?? null,
    content.calorieBalanceText ?? null,
    content.calorieBalanceKcal ?? null,
    content.musclesTrained ? JSON.stringify(content.musclesTrained) : null,
    content.workoutDurationMin ?? null,
    content.workoutCaloriesBurned ?? null,
    content.workoutExercises ? JSON.stringify(content.workoutExercises) : null,
  );
  const row = await db.getFirstAsync<AIReportRow>('SELECT * FROM ai_reports WHERE id = ?', result.lastInsertRowId);
  if (!row) {
    throw new Error('saveReport: row missing immediately after insert');
  }
  return mapRow(row);
}

/** The most recently generated report for a date, if more than one exists. */
export async function getLatestReportForDate(db: SQLiteDatabase, date: string): Promise<AIReport | null> {
  const row = await db.getFirstAsync<AIReportRow>(
    'SELECT * FROM ai_reports WHERE report_date = ? ORDER BY created_at DESC LIMIT 1',
    date,
  );
  return row ? mapRow(row) : null;
}

/** Most recent reports, newest first, bounded by `limit` — for future weekly/monthly rollups, never a full scan. */
export async function getRecentReports(db: SQLiteDatabase, limit: number): Promise<AIReport[]> {
  const rows = await db.getAllAsync<AIReportRow>(
    'SELECT * FROM ai_reports ORDER BY report_date DESC LIMIT ?',
    limit,
  );
  return rows.map(mapRow);
}

export async function deleteReport(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM ai_reports WHERE id = ?', id);
}

/** Every report whose `report_date` falls within `[startDate, endDate]` inclusive — backs the Progress Weekly/Monthly views, which need a real window rather than a fixed row count. */
export async function getReportsInRange(db: SQLiteDatabase, startDate: string, endDate: string): Promise<AIReport[]> {
  const rows = await db.getAllAsync<AIReportRow>(
    'SELECT * FROM ai_reports WHERE report_date >= ? AND report_date <= ? ORDER BY report_date ASC',
    startDate,
    endDate,
  );
  return rows.map(mapRow);
}
