import type { SQLiteDatabase } from 'expo-sqlite';

import type { AIReport, AIReportContent } from '../types';

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
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
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
      tomorrow_suggestions, raw_response
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
