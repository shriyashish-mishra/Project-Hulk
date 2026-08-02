import type { AIReport, AIReportScores } from '@/features/ai/types';

function average(values: number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/** A plain average of every report's scores in a window — Weekly/Monthly's "at a glance" tiles. `null` when the window has no reports yet. */
export function computeAverageScores(reports: AIReport[]): AIReportScores | null {
  if (reports.length === 0) return null;
  return {
    nutrition: average(reports.map((report) => report.scores.nutrition)),
    activity: average(reports.map((report) => report.scores.activity)),
    recovery: average(reports.map((report) => report.scores.recovery)),
  };
}
