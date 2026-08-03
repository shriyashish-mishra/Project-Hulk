import type { WeightUnit } from '@/features/exercise-library/types';

/** One completed session's record of a single exercise — the raw material every calculation on this page works from. */
export interface ExerciseHistoryEntry {
  sessionId: number;
  completedAt: string;
  weight: number | null;
  weightUnit: WeightUnit | null;
  reps: number | null;
  setsCompleted: number;
  setsPlanned: number | null;
}

/** One entry in the "Recently Trained Exercises" picker — every strength exercise ever completed, not a capped recent list. */
export interface RecentExercise {
  exerciseId: number;
  name: string;
  defaultUnit: WeightUnit;
  lastCompletedAt: string;
}

export type TrendDirection = 'up' | 'down' | 'flat';

export interface ExerciseTrend {
  direction: TrendDirection;
  deltaWeight: number;
}

export interface PersonalRecords {
  maxWeight: { value: number; unit: WeightUnit; sessionId: number } | null;
  maxReps: { value: number; sessionId: number } | null;
  /** Best single session's weight × reps × setsCompleted — not summed across sessions, which would reward frequency over intensity. */
  maxVolume: { value: number; sessionId: number } | null;
}

export type RecommendationConfidence = 'low' | 'medium' | 'high';

export interface WeightRecommendation {
  action: 'increase' | 'hold';
  nextWeight: number | null;
  confidence: RecommendationConfidence;
  reason: string;
}

export interface ExerciseProgressSummary {
  exercise: RecentExercise;
  /** Newest first. */
  history: ExerciseHistoryEntry[];
  trend: ExerciseTrend | null;
  personalRecords: PersonalRecords;
  recommendation: WeightRecommendation;
  insight: string;
}
