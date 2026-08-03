import type { SQLiteDatabase } from 'expo-sqlite';

import { AIReportService } from '@/features/ai/services';
import type { WeightUnit } from '@/features/exercise-library/types';
import type { WorkoutSession } from '@/features/workout-sessions/types';
import { getCompletedSessions, getExerciseSessionHistory, getRecentlyTrainedExercises } from '../repository';
import type {
  ExerciseHistoryEntry,
  ExerciseProgressSummary,
  ExerciseTrend,
  PersonalRecords,
  RecentExercise,
  WeightRecommendation,
} from '../types';

const TREND_WINDOW = 3;
const FLAT_THRESHOLD = 0.5;
/** Matches the spec's own worked example ("4 sets of 15+ reps") — a fixed heuristic, not per-exercise configurable in v1. */
const HIGH_REP_THRESHOLD = 15;
const KG_INCREMENT = 1;
const LBS_INCREMENT = 5;
const RECENT_REPORTS_TO_SCAN = 5;

/**
 * Latest completed session vs. up to `TREND_WINDOW` sessions back —
 * deliberately simple, mirroring `WeightService.computeTrend`'s "not a
 * smoothed average or regression line" philosophy, applied per-session
 * instead of per-calendar-day since workouts aren't daily.
 */
function computeTrend(history: ExerciseHistoryEntry[]): ExerciseTrend | null {
  const withWeight = history.filter((entry): entry is ExerciseHistoryEntry & { weight: number } => entry.weight !== null);
  if (withWeight.length < 2) return null;
  const latest = withWeight[0];
  const comparison = withWeight[Math.min(TREND_WINDOW - 1, withWeight.length - 1)];
  const deltaWeight = Number((latest.weight - comparison.weight).toFixed(1));
  const direction = deltaWeight > FLAT_THRESHOLD ? 'up' : deltaWeight < -FLAT_THRESHOLD ? 'down' : 'flat';
  return { direction, deltaWeight };
}

function computePersonalRecords(history: ExerciseHistoryEntry[]): PersonalRecords {
  let maxWeight: PersonalRecords['maxWeight'] = null;
  let maxReps: PersonalRecords['maxReps'] = null;
  let maxVolume: PersonalRecords['maxVolume'] = null;

  for (const entry of history) {
    if (entry.weight !== null && entry.weightUnit !== null) {
      if (!maxWeight || entry.weight > maxWeight.value) {
        maxWeight = { value: entry.weight, unit: entry.weightUnit, sessionId: entry.sessionId };
      }
    }
    if (entry.reps !== null) {
      if (!maxReps || entry.reps > maxReps.value) {
        maxReps = { value: entry.reps, sessionId: entry.sessionId };
      }
    }
    if (entry.weight !== null && entry.reps !== null) {
      const volume = entry.weight * entry.reps * entry.setsCompleted;
      if (!maxVolume || volume > maxVolume.value) {
        maxVolume = { value: volume, sessionId: entry.sessionId };
      }
    }
  }

  return { maxWeight, maxReps, maxVolume };
}

/**
 * Rule-based, computed entirely from local session history — this app
 * never makes live AI calls, so a per-exercise recommendation has to be
 * deterministic. Looks at the last three completed sessions: consistent
 * high reps at the same weight, sets fully completed, means "add weight
 * next time"; anything less consistent means "hold," and fewer than
 * three sessions means there isn't enough signal to recommend anything.
 */
function computeRecommendation(history: ExerciseHistoryEntry[], unit: WeightUnit): WeightRecommendation {
  const usable = history.filter((entry): entry is ExerciseHistoryEntry & { weight: number } => entry.weight !== null);
  if (usable.length < TREND_WINDOW) {
    return { action: 'hold', nextWeight: null, confidence: 'low', reason: 'Not enough session history yet' };
  }

  const last3 = usable.slice(0, TREND_WINDOW);
  const currentWeight = last3[0].weight;
  const sameWeight = last3.every((entry) => entry.weight === currentWeight);
  const setsComplete = last3.every((entry) => entry.setsCompleted >= (entry.setsPlanned ?? entry.setsCompleted));
  const highReps = last3.every((entry) => entry.reps !== null && entry.reps >= HIGH_REP_THRESHOLD);

  if (sameWeight && setsComplete && highReps) {
    const increment = unit === 'kg' ? KG_INCREMENT : LBS_INCREMENT;
    return {
      action: 'increase',
      nextWeight: Number((currentWeight + increment).toFixed(1)),
      confidence: 'high',
      reason: 'Target reps achieved consistently for 3 sessions',
    };
  }

  return {
    action: 'hold',
    nextWeight: currentWeight,
    confidence: 'medium',
    reason: 'Target reps not consistently completed',
  };
}

function formatWeight(value: number, unit: WeightUnit): string {
  return `${value}${unit}`;
}

/**
 * A natural-language summary computed from the same numbers already on
 * the page — always available, zero cost. `aiFeedbackHint`, when a
 * recent AI report happened to mention this exercise by name, is
 * prepended as a bonus, not relied on as the primary source (most
 * reports won't mention any specific exercise).
 */
function computeInsight(
  history: ExerciseHistoryEntry[],
  name: string,
  trend: ExerciseTrend | null,
  recommendation: WeightRecommendation,
  aiFeedbackHint?: string,
): string {
  const usable = history.filter(
    (entry): entry is ExerciseHistoryEntry & { weight: number; weightUnit: WeightUnit } =>
      entry.weight !== null && entry.weightUnit !== null,
  );
  if (usable.length === 0) {
    return `No completed sessions for ${name} yet.`;
  }

  const oldest = usable[usable.length - 1];
  const newest = usable[0];
  const unit = newest.weightUnit;

  const sentences: string[] = [];
  if (aiFeedbackHint) sentences.push(aiFeedbackHint);

  if (usable.length >= 2 && oldest.weight !== newest.weight) {
    sentences.push(
      `${name} moved from ${formatWeight(oldest.weight, unit)} to ${formatWeight(newest.weight, unit)} across ${usable.length} sessions.`,
    );
  } else {
    sentences.push(`${name} has been steady at ${formatWeight(newest.weight, unit)} across ${usable.length} sessions.`);
  }

  if (trend?.direction === 'up') {
    sentences.push('Rep consistency is strong.');
  } else if (trend?.direction === 'down') {
    sentences.push('Recent weight has dipped — worth checking recovery or form.');
  }

  if (recommendation.action === 'increase' && recommendation.nextWeight !== null) {
    sentences.push(`Ready to progress to ${formatWeight(recommendation.nextWeight, unit)} next session.`);
  } else if (recommendation.confidence !== 'low') {
    sentences.push('Hold at the current weight until reps are more consistent.');
  }

  return sentences.join(' ');
}

/** Best-effort scan of recent AI reports' free-text workout feedback for a mention of this exercise — a bonus signal, never the only source (see `computeInsight`). */
async function findAiFeedbackHint(db: SQLiteDatabase, exerciseName: string): Promise<string | undefined> {
  const reports = await AIReportService.getRecentReports(db);
  const needle = exerciseName.toLowerCase();
  for (const report of reports.slice(0, RECENT_REPORTS_TO_SCAN)) {
    if (report.workoutFeedback.toLowerCase().includes(needle)) {
      return report.workoutFeedback;
    }
  }
  return undefined;
}

export const WorkoutProgressService = {
  async getRecentExercises(db: SQLiteDatabase): Promise<RecentExercise[]> {
    return getRecentlyTrainedExercises(db);
  },

  async getExerciseSummary(db: SQLiteDatabase, exercise: RecentExercise): Promise<ExerciseProgressSummary> {
    const history = await getExerciseSessionHistory(db, exercise.exerciseId);
    const trend = computeTrend(history);
    const personalRecords = computePersonalRecords(history);
    const recommendation = computeRecommendation(history, exercise.defaultUnit);
    const aiFeedbackHint = await findAiFeedbackHint(db, exercise.name);
    const insight = computeInsight(history, exercise.name, trend, recommendation, aiFeedbackHint);

    return { exercise, history, trend, personalRecords, recommendation, insight };
  },

  async getCompletedSessions(db: SQLiteDatabase): Promise<WorkoutSession[]> {
    return getCompletedSessions(db);
  },
};
