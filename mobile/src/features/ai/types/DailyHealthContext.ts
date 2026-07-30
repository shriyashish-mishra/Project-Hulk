import type { MealType } from '@/features/food/types';
import type { SleepQuality } from '@/features/sleep/types';
import type { TrendDirection } from '@/features/weight/services';

/** Bumped whenever this shape changes — stored alongside every report so a future prompt/parser upgrade never has to guess what an old context looked like. */
export const CONTEXT_VERSION = 'v1';

export interface JournalContext {
  text: string;
  wordCount: number;
  hasEntry: boolean;
  /** `null` when there's no entry yet today. */
  updatedAt: string | null;
}

export interface MealContext {
  type: MealType;
  content: string;
}

export interface NutritionContext {
  meals: MealContext[];
  loggedCount: number;
  expectedCount: number;
}

export interface HydrationContext {
  totalMl: number;
  goalMl: number;
  completionPercent: number;
  /** Timestamps of each addition today, if any — lets Claude notice patterns like "all water logged in the evening" without the app doing that analysis itself. */
  entryTimes: string[];
}

export interface ActivityContext {
  completed: boolean;
  workoutType: string | null;
  durationMinutes: number | null;
  notes: string | null;
}

export interface RecoveryContext {
  sleepDurationMinutes: number | null;
  sleepQuality: SleepQuality | null;
  bedtime: string | null;
  wakeTime: string | null;
}

export interface WeightContext {
  latestKg: number | null;
  trend: { direction: TrendDirection; deltaKg: number } | null;
}

export interface CycleContext {
  activePeriod: boolean;
  recentPeriodCount: number;
}

/**
 * The complete, versioned daily snapshot handed to the prompt builder.
 * Assembled once per report by `buildDailyHealthContext` from every
 * feature's own service — never from a repository or SQLite directly.
 * `cycle` is only ever present when the user has opted in *and* has data;
 * its absence (not `null`, not `{ enabled: false }`) is the privacy
 * guarantee — nothing about cycle tracking is ever implied by its shape.
 */
export interface DailyHealthContext {
  date: string;
  contextVersion: string;
  journal: JournalContext;
  nutrition: NutritionContext;
  hydration: HydrationContext;
  activity: ActivityContext;
  recovery: RecoveryContext;
  weight: WeightContext;
  cycle?: CycleContext;
}
