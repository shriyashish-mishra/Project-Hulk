import type { SQLiteDatabase } from 'expo-sqlite';

import { AIReportService } from '@/features/ai/services';
import type { WeightUnit } from '@/features/exercise-library/types';
import type { WorkoutSession, WorkoutSessionWithExercises } from '@/features/workout-sessions/types';
import {
  applyTemplateExerciseWeight,
  getCompletedSessions,
  getExerciseSessionHistory,
  getRecentlyTrainedExercises,
} from '../repository';
import type {
  ExerciseHistoryEntry,
  ExerciseProgressSummary,
  ExerciseTrend,
  PersonalRecords,
  RecentExercise,
  SessionWeightSuggestion,
  WeightRecommendation,
} from '../types';

const TREND_WINDOW = 3;
const FLAT_THRESHOLD = 0.5;
/** Matches the spec's own worked example ("4 sets of 15+ reps") — a fixed heuristic, not per-exercise configurable in v1. */
const HIGH_REP_THRESHOLD = 15;
/** Below this, at the same weight for 3 straight sessions, reads as "too heavy" rather than "still building up" — most strength/hypertrophy work targets 6-15 reps. */
const LOW_REP_THRESHOLD = 6;
const RECENT_REPORTS_TO_SCAN = 5;

/**
 * Real equipment tables (commercial Indian gyms — dumbbells step by
 * 2.5kg, not 1kg; kettlebells and plates run their own irregular
 * sequences) so a recommendation always lands on a weight that's
 * actually stocked, not just "current + a fixed amount." Extended
 * beyond each table's explicit top end by repeating its last step.
 */
const DUMBBELL_WEIGHTS_KG = [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 40];
const KETTLEBELL_WEIGHTS_KG = [4, 6, 8, 10, 12, 16, 20, 24, 28, 32];
const PLATE_WEIGHTS_KG = [1.25, 2.5, 5, 10, 15, 20];
/** 1 slate on a standard selectorized machine stack. */
const MACHINE_STACK_STEP_KG = 5;
const MACHINE_STACK_STEP_LBS = 5;

type EquipmentType = 'dumbbell' | 'kettlebell' | 'plate' | 'machine';

/**
 * Guesses equipment from the exercise name plus a free-text hint (its
 * most recent logged detail, when one exists) — this app's exercise
 * library has no dedicated equipment field. Lbs-unit exercises are
 * always machine/cable work by this app's own convention; everything
 * else defaults to dumbbell, the most common free-weight case in this
 * app's actual exercise names (curls, presses, pullovers, raises).
 */
function detectEquipmentType(exerciseName: string, hintText: string | null | undefined, unit: WeightUnit): EquipmentType {
  if (unit === 'lbs') return 'machine';
  const haystack = `${exerciseName} ${hintText ?? ''}`.toLowerCase();
  if (haystack.includes('kettlebell')) return 'kettlebell';
  if (haystack.includes('plate')) return 'plate';
  if (haystack.includes('machine') || haystack.includes('cable') || haystack.includes('stack')) return 'machine';
  return 'dumbbell';
}

/** First table value strictly above `current`, or `current` plus the table's own last step once past its explicit top end. */
function nextFromSequence(current: number, sequence: number[]): number {
  const next = sequence.find((weight) => weight > current + 0.01);
  if (next !== undefined) return next;
  const lastStep = sequence.length >= 2 ? sequence[sequence.length - 1] - sequence[sequence.length - 2] : sequence[0];
  return Number((current + lastStep).toFixed(2));
}

function nextRealisticWeight(
  current: number,
  unit: WeightUnit,
  exerciseName: string,
  hintText: string | null | undefined,
): number {
  switch (detectEquipmentType(exerciseName, hintText, unit)) {
    case 'kettlebell':
      return nextFromSequence(current, KETTLEBELL_WEIGHTS_KG);
    case 'plate':
      return nextFromSequence(current, PLATE_WEIGHTS_KG);
    case 'machine':
      return current + (unit === 'lbs' ? MACHINE_STACK_STEP_LBS : MACHINE_STACK_STEP_KG);
    case 'dumbbell':
    default:
      return nextFromSequence(current, DUMBBELL_WEIGHTS_KG);
  }
}

/** First table value strictly below `current`, or the table's smallest entry once at/under its explicit floor — never suggests dropping below what's actually stocked. */
function prevFromSequence(current: number, sequence: number[]): number {
  const prev = [...sequence].reverse().find((weight) => weight < current - 0.01);
  return prev ?? sequence[0];
}

function prevRealisticWeight(
  current: number,
  unit: WeightUnit,
  exerciseName: string,
  hintText: string | null | undefined,
): number {
  const step = unit === 'lbs' ? MACHINE_STACK_STEP_LBS : MACHINE_STACK_STEP_KG;
  switch (detectEquipmentType(exerciseName, hintText, unit)) {
    case 'kettlebell':
      return prevFromSequence(current, KETTLEBELL_WEIGHTS_KG);
    case 'plate':
      return prevFromSequence(current, PLATE_WEIGHTS_KG);
    case 'machine':
      return Math.max(step, current - step);
    case 'dumbbell':
    default:
      return prevFromSequence(current, DUMBBELL_WEIGHTS_KG);
  }
}

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
 * high reps at the same weight with sets fully completed means "add
 * weight next time"; consistently failing sets at low reps at the same
 * weight means the opposite — "this is too heavy, ease off." Anything
 * less consistent means "hold," and fewer than three sessions means
 * there isn't enough signal to recommend anything.
 */
function computeRecommendation(history: ExerciseHistoryEntry[], unit: WeightUnit, exerciseName: string): WeightRecommendation {
  const usable = history.filter((entry): entry is ExerciseHistoryEntry & { weight: number } => entry.weight !== null);
  if (usable.length < TREND_WINDOW) {
    return { action: 'hold', nextWeight: null, confidence: 'low', reason: 'Not enough session history yet' };
  }

  const last3 = usable.slice(0, TREND_WINDOW);
  const currentWeight = last3[0].weight;
  const potentialNextWeight = nextRealisticWeight(currentWeight, unit, exerciseName, undefined);
  const potentialPrevWeight = prevRealisticWeight(currentWeight, unit, exerciseName, undefined);

  const sameWeight = last3.every((entry) => entry.weight === currentWeight);
  const setsComplete = last3.every((entry) => entry.setsCompleted >= (entry.setsPlanned ?? entry.setsCompleted));
  const highReps = last3.every((entry) => entry.reps !== null && entry.reps >= HIGH_REP_THRESHOLD);
  const failingSets = last3.every((entry) => entry.setsCompleted < (entry.setsPlanned ?? entry.setsCompleted));
  const lowReps = last3.every((entry) => entry.reps !== null && entry.reps <= LOW_REP_THRESHOLD);

  if (sameWeight && setsComplete && highReps) {
    return {
      action: 'increase',
      nextWeight: potentialNextWeight,
      confidence: 'high',
      reason: 'Target reps achieved consistently for 3 sessions',
    };
  }

  if (sameWeight && failingSets && lowReps) {
    return {
      action: 'decrease',
      nextWeight: potentialPrevWeight,
      confidence: 'high',
      reason: 'Sets and reps have dropped consistently for 3 sessions',
    };
  }

  return {
    action: 'hold',
    nextWeight: currentWeight,
    confidence: 'medium',
    // Always names the target that unlocks the next increase — "hold" on
    // its own doesn't tell you what to aim for next session.
    reason: `Increase to ${potentialNextWeight}${unit} once you complete all sets at ${HIGH_REP_THRESHOLD}+ reps for 3 sessions in a row`,
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
  } else if (recommendation.action === 'decrease' && recommendation.nextWeight !== null) {
    sentences.push(`Consider easing to ${formatWeight(recommendation.nextWeight, unit)} next session.`);
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
    const recommendation = computeRecommendation(history, exercise.defaultUnit, exercise.name);
    const aiFeedbackHint = await findAiFeedbackHint(db, exercise.name);
    const insight = computeInsight(history, exercise.name, trend, recommendation, aiFeedbackHint);

    return { exercise, history, trend, personalRecords, recommendation, insight };
  },

  async getCompletedSessions(db: SQLiteDatabase): Promise<WorkoutSession[]> {
    return getCompletedSessions(db);
  },

  /**
   * Right after a session finishes, feeds its own just-completed sets
   * back into the recommendation engine and writes any resulting
   * increase/decrease straight onto the originating template's default
   * weight — so the next time this template starts a session, the
   * pre-filled weight already reflects Hulk's call instead of whatever
   * was lifted last time. Ad-hoc sessions (no `templateId`) are left
   * untouched.
   */
  async applyRecommendationsToTemplate(db: SQLiteDatabase, session: WorkoutSessionWithExercises): Promise<void> {
    if (!session.templateId) return;
    const templateId = session.templateId;

    for (const sessionExercise of session.exercises) {
      if (sessionExercise.category !== 'strength' || sessionExercise.weightUnit === null) continue;

      const history = await getExerciseSessionHistory(db, sessionExercise.exerciseId);
      const recommendation = computeRecommendation(history, sessionExercise.weightUnit, sessionExercise.exerciseName);
      if (recommendation.action === 'hold' || recommendation.nextWeight === null) continue;

      await applyTemplateExerciseWeight(db, templateId, sessionExercise.exerciseId, recommendation.nextWeight);
    }
  },

  /**
   * Flags exercises in an in-progress session whose pre-filled weight
   * already reflects a Hulk-computed bump/ease applied to the template
   * when the prior session on it was completed — recomputing the same
   * recommendation from history (which never includes this
   * still-uncompleted session) and checking it against the exercise's
   * current weight keeps this in permanent agreement with
   * `applyRecommendationsToTemplate` without persisting anything extra.
   */
  async getSessionWeightSuggestions(
    db: SQLiteDatabase,
    session: WorkoutSessionWithExercises,
  ): Promise<Record<number, SessionWeightSuggestion>> {
    const result: Record<number, SessionWeightSuggestion> = {};

    for (const sessionExercise of session.exercises) {
      if (sessionExercise.category !== 'strength' || sessionExercise.weight === null || sessionExercise.weightUnit === null) {
        continue;
      }

      const history = await getExerciseSessionHistory(db, sessionExercise.exerciseId);
      const lastLifted = history.find((entry) => entry.weight !== null)?.weight ?? null;
      if (lastLifted === null || lastLifted === sessionExercise.weight) continue;

      const recommendation = computeRecommendation(history, sessionExercise.weightUnit, sessionExercise.exerciseName);
      if (
        (recommendation.action === 'increase' || recommendation.action === 'decrease') &&
        recommendation.nextWeight === sessionExercise.weight
      ) {
        result[sessionExercise.id] = {
          action: recommendation.action,
          previousWeight: lastLifted,
          nextWeight: sessionExercise.weight,
        };
      }
    }

    return result;
  },
};
