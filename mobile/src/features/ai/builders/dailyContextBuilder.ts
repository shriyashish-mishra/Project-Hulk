import type { SQLiteDatabase } from 'expo-sqlite';

import { CycleService } from '@/features/cycle/services';
import { MEAL_TYPES } from '@/features/food/types';
import { FoodService } from '@/features/food/services';
import { JournalService } from '@/features/journal/services';
import { ProfileService } from '@/features/profile/services';
import { SleepService } from '@/features/sleep/services';
import { WaterService } from '@/features/water/services';
import { WeightService } from '@/features/weight/services';
import { WorkoutService } from '@/features/workout/services';

import { CONTEXT_VERSION } from '../types';
import type { DailyHealthContext, MealContext } from '../types';

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Assembles a day's complete AI context from every feature's own service
 * — `AI Builder → Feature Services → Repositories → SQLite`, never a
 * repository or raw SQLite query from here. This is the one place that
 * turns seven independent features into a single coherent picture;
 * nothing downstream (the prompt builder, the parser, storage) needs to
 * know where any of it came from.
 */
export async function buildDailyHealthContext(db: SQLiteDatabase, date: string): Promise<DailyHealthContext> {
  const [journalContent, mealsByType, waterSummary, workoutLog, weightHistory, sleepLog, cycleEnabled, targets] =
    await Promise.all([
      JournalService.getEditableContent(db, date),
      FoodService.getMealsForDate(db, date),
      WaterService.getSummary(db, date),
      WorkoutService.getWorkoutForDate(db, date),
      WeightService.getHistoryWithTrend(db),
      SleepService.getSleepForDate(db, date),
      CycleService.isEnabled(db),
      ProfileService.getTargets(db),
    ]);

  const meals: MealContext[] = [];
  for (const type of MEAL_TYPES) {
    const meal = mealsByType[type];
    if (meal) {
      meals.push({ type, content: meal.rawText });
    }
  }

  const context: DailyHealthContext = {
    date,
    contextVersion: CONTEXT_VERSION,
    journal: {
      text: journalContent.body,
      wordCount: countWords(journalContent.body),
      hasEntry: journalContent.body.trim().length > 0,
      updatedAt: journalContent.updatedAt,
    },
    nutrition: {
      meals,
      loggedCount: meals.length,
      expectedCount: MEAL_TYPES.length,
    },
    hydration: {
      totalMl: waterSummary.totalMl,
      goalMl: waterSummary.goalMl,
      completionPercent:
        waterSummary.goalMl > 0 ? Math.round((waterSummary.totalMl / waterSummary.goalMl) * 100) : 0,
      entryTimes: waterSummary.entries.map((entry) => entry.createdAt),
    },
    activity: {
      completed: workoutLog !== null,
      workoutType: workoutLog?.workoutType ?? null,
      durationMinutes: workoutLog?.durationMinutes ?? null,
      notes: workoutLog?.notes ?? null,
    },
    recovery: {
      sleepDurationMinutes: sleepLog?.durationMinutes ?? null,
      sleepQuality: sleepLog?.quality ?? null,
      bedtime: sleepLog?.bedtime ?? null,
      wakeTime: sleepLog?.wakeTime ?? null,
    },
    weight: {
      latestKg: weightHistory.history[0]?.weightKg ?? null,
      trend: weightHistory.trend,
    },
    targets: {
      primaryGoal: targets.profile?.primaryGoal ?? null,
      activityLevel: targets.profile?.activityLevel ?? null,
      trainingFrequency: targets.profile?.trainingFrequency ?? null,
      proteinTargetG: targets.proteinTargetG,
      calorieRangeKcal: targets.calorieRangeKcal,
      carbsTargetG: targets.carbsTargetG,
      fatTargetG: targets.fatTargetG,
      fiberTargetG: targets.fiberTargetG,
      targetWeightKg: targets.profile?.targetWeightKg ?? null,
    },
  };

  // Only ever present when opted in AND there's something to say — its
  // absence (not `null`, not a disabled flag) is the privacy guarantee.
  if (cycleEnabled) {
    const [activePeriod, recentPeriods] = await Promise.all([
      CycleService.getActivePeriod(db),
      CycleService.getRecentPeriods(db),
    ]);
    if (activePeriod || recentPeriods.length > 0) {
      context.cycle = {
        activePeriod: activePeriod !== null,
        recentPeriodCount: recentPeriods.length,
      };
    }
  }

  return context;
}
