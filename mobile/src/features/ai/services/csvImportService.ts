import type { SQLiteDatabase } from 'expo-sqlite';

import { csvRowsToRecords, parseCsv } from '@/core/csv';
import { getLatestReportForDate, saveReport } from '../repository';
import type { AIReportContent, AIReportExercise } from '../types';

/** The report shape produced by web's "Full Data (JSON)" export column — only the fields mobile actually reads out of it. */
interface WebReportJson {
  estimated_calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  calorie_balance?: string;
  calorie_balance_kcal?: number;
  recovery_score?: number;
  muscles_trained?: string[];
  workout_duration_min?: number;
  workout_calories_burned?: number;
  workout_exercises?: { name: string; detail?: string; calories_burned?: number }[];
  strengths?: string[];
  improvements?: string[];
  coach_summary?: string;
  tomorrow_workout?: string;
  tomorrow_meals?: { meal_type: string; suggestion: string }[];
}

const PROMPT_VERSION = 'web-csv-import';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface CsvImportSummary {
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function splitSemicolon(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseWebExercises(value: string | undefined): AIReportExercise[] | undefined {
  const names = splitSemicolon(value);
  if (names.length === 0) return undefined;
  // Flat-column exercises are "Name (detail, Xkcal)" — human-readable,
  // not reliably re-parseable (a name could itself contain a comma or
  // parenthesis). Only used when the JSON column is missing entirely;
  // degrading to name-only here is an accepted, visible loss for that
  // fallback path.
  return names.map((entry) => ({ name: entry.replace(/\s*\(.*\)\s*$/, '').trim() || entry }));
}

/** Prefers the row's "Full Data (JSON)" column — everything in it round-trips exactly. Falls back to the flat, human-readable columns only when that column is missing or malformed (e.g. a hand-edited CSV, or one exported before this column existed). */
function mapRecordToContent(record: Record<string, string>): AIReportContent {
  let webJson: WebReportJson | null = null;
  const rawJson = record['Full Data (JSON)'];
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (typeof parsed === 'object' && parsed !== null) webJson = parsed as WebReportJson;
    } catch {
      webJson = null;
    }
  }

  const estimatedCalories = webJson?.estimated_calories ?? parseNumber(record['Calories (kcal)']);
  const proteinG = webJson?.protein_g ?? parseNumber(record['Protein (g)']);
  const carbsG = webJson?.carbs_g ?? parseNumber(record['Carbs (g)']);
  const fatG = webJson?.fat_g ?? parseNumber(record['Fat (g)']);
  const fiberG = webJson?.fiber_g ?? parseNumber(record['Fiber (g)']);
  const calorieBalanceText = webJson?.calorie_balance ?? (record['Calorie Balance'] || undefined);
  const calorieBalanceKcal = webJson?.calorie_balance_kcal ?? parseNumber(record['Calorie Balance (kcal)']);
  const recoveryScoreRaw = webJson?.recovery_score ?? parseNumber(record['Recovery Score']);
  const musclesTrained = webJson?.muscles_trained ?? splitSemicolon(record['Muscles Trained']);
  const workoutDurationMin = webJson?.workout_duration_min ?? parseNumber(record['Workout Duration (min)']);
  const workoutCaloriesBurned = webJson?.workout_calories_burned ?? parseNumber(record['Workout Calories Burned']);
  const workoutExercises: AIReportExercise[] | undefined = webJson?.workout_exercises?.length
    ? webJson.workout_exercises.map((exercise) => ({
        name: exercise.name,
        ...(exercise.detail ? { detail: exercise.detail } : {}),
        ...(exercise.calories_burned !== undefined ? { caloriesBurned: exercise.calories_burned } : {}),
      }))
    : parseWebExercises(record['Workout Exercises']);
  const wins = webJson?.strengths ?? splitSemicolon(record['Strengths']);
  const improvements = webJson?.improvements ?? splitSemicolon(record['Improvements']);
  const summary = webJson?.coach_summary ?? record['Coach Summary'] ?? '';

  // Neither of web's "tomorrow" fields has a dedicated destination in
  // mobile's schema — folded into tomorrowSuggestions rather than
  // dropped, so the content survives even without an identical field.
  const tomorrowSuggestions: string[] = [];
  const tomorrowWorkout = webJson?.tomorrow_workout ?? record["Tomorrow's Workout"];
  if (tomorrowWorkout) tomorrowSuggestions.push(`Workout: ${tomorrowWorkout}`);
  const tomorrowMeals = webJson?.tomorrow_meals;
  if (tomorrowMeals?.length) {
    for (const meal of tomorrowMeals) tomorrowSuggestions.push(`${meal.meal_type}: ${meal.suggestion}`);
  } else {
    for (const meal of splitSemicolon(record["Tomorrow's Meals"])) tomorrowSuggestions.push(meal);
  }

  return {
    summary,
    scores: {
      nutrition: parseNumber(record['Nutrition Score']) ?? 50,
      activity: parseNumber(record['Workout Score']) ?? 50,
      recovery: recoveryScoreRaw ?? 50,
    },
    wins,
    improvements,
    nutritionFeedback: '',
    workoutFeedback: '',
    recoveryFeedback: '',
    tomorrowSuggestions,
    rawResponse: record['Raw Response'] ?? '',
    estimatedCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    calorieBalanceText,
    calorieBalanceKcal,
    musclesTrained: musclesTrained.length > 0 ? musclesTrained : undefined,
    workoutDurationMin,
    workoutCaloriesBurned,
    workoutExercises,
  };
}

/**
 * Backfills `ai_reports` from a CSV exported by the web app's
 * `/report/export` — the only cross-platform migration path for
 * historical report data, since web (Postgres, its own AiReportJson
 * shape) and mobile (SQLite, dailyReport.v2's shape) never shared a
 * schema. Idempotent: re-running the same CSV skips any date that
 * already has a report (imported or otherwise) rather than creating
 * duplicate history rows.
 */
export async function importReportsFromCsv(db: SQLiteDatabase, csvText: string): Promise<CsvImportSummary> {
  const records = csvRowsToRecords(parseCsv(csvText));
  const summary: CsvImportSummary = { imported: 0, skipped: 0, failed: 0, errors: [] };

  for (const record of records) {
    const date = record.Date;
    if (!date || !DATE_PATTERN.test(date)) {
      summary.failed += 1;
      summary.errors.push(`Row with date "${date || '(blank)'}" — not a valid YYYY-MM-DD date, skipped.`);
      continue;
    }

    const existing = await getLatestReportForDate(db, date);
    if (existing) {
      summary.skipped += 1;
      continue;
    }

    try {
      const content = mapRecordToContent(record);
      await saveReport(db, date, PROMPT_VERSION, PROMPT_VERSION, content);
      summary.imported += 1;
    } catch (err) {
      summary.failed += 1;
      summary.errors.push(`${date}: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  }

  return summary;
}
