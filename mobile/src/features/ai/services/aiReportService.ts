import type { SQLiteDatabase } from 'expo-sqlite';

import { buildDailyHealthContext } from '../builders';
import { parseDailyReportV2 } from '../parser';
import { buildDailyReportPromptV2 } from '../prompts';
import {
  deleteReport as deleteReportRow,
  getLatestReportForDate,
  getRecentReports,
  saveReport,
} from '../repository';
import type { AIReport, AIReportScores, ClaudePromptPackage } from '../types';

export interface SubmitReportResponseResult {
  report: AIReport;
  parseWarnings: string[];
}

const RECENT_REPORTS_LIMIT = 30;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function average(values: number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/**
 * The AI feature's business logic — the only place that wires the
 * pipeline together end to end (`User Data → Context → Prompt →
 * (Claude, outside the app) → Parser → SQLite`). Hooks and UI call this;
 * nothing else in the app touches the builder, prompt, or parser directly.
 */
export const AIReportService = {
  /** Builds today's context and turns it into the exact text to hand to Claude. Read-only — nothing is saved until a response comes back. */
  async prepareReport(db: SQLiteDatabase, date: string): Promise<ClaudePromptPackage> {
    const context = await buildDailyHealthContext(db, date);
    return buildDailyReportPromptV2(context);
  },

  /** Parses what the user pasted back and saves it — the only place an `ai_reports` row is written. */
  async submitResponse(
    db: SQLiteDatabase,
    date: string,
    promptPackage: ClaudePromptPackage,
    rawResponse: string,
  ): Promise<SubmitReportResponseResult> {
    const { content, parseWarnings } = parseDailyReportV2(rawResponse);
    const report = await saveReport(db, date, promptPackage.contextVersion, promptPackage.promptVersion, content);
    return { report, parseWarnings };
  },

  async getLatestReport(db: SQLiteDatabase, date: string): Promise<AIReport | null> {
    return getLatestReportForDate(db, date);
  },

  /** Bounded history for the Insights screen — never a full scan of every report ever generated. */
  async getRecentReports(db: SQLiteDatabase): Promise<AIReport[]> {
    return getRecentReports(db, RECENT_REPORTS_LIMIT);
  },

  /** A plain average of whatever reports fall within the last 7 days — not a weighted trend, just "roughly how has this week gone." `null` when there's nothing in that window yet. */
  async getWeeklyAverageScores(db: SQLiteDatabase): Promise<AIReportScores | null> {
    const reports = await getRecentReports(db, RECENT_REPORTS_LIMIT);
    const weekAgo = Date.now() - WEEK_IN_MS;
    const recentReports = reports.filter((report) => new Date(report.date).getTime() >= weekAgo);
    if (recentReports.length === 0) return null;

    return {
      nutrition: average(recentReports.map((report) => report.scores.nutrition)),
      activity: average(recentReports.map((report) => report.scores.activity)),
      recovery: average(recentReports.map((report) => report.scores.recovery)),
    };
  },

  async deleteReport(db: SQLiteDatabase, id: number): Promise<void> {
    await deleteReportRow(db, id);
  },
};
