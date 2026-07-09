import { getDaysAgoDateString } from "@/lib/date";

/**
 * Consecutive days ending today with activity in `datesWithActivity`.
 * Today gets a grace period — if it hasn't happened yet, we start
 * counting from yesterday instead of breaking the streak early.
 */
export function computeConsecutiveStreak(
  datesWithActivity: Set<string>,
  today: string,
  maxLookback = 60,
): number {
  let cursor = today;
  if (!datesWithActivity.has(cursor)) {
    cursor = getDaysAgoDateString(1, new Date(`${today}T00:00:00`));
  }

  let streak = 0;
  for (let i = 0; i < maxLookback; i++) {
    if (!datesWithActivity.has(cursor)) break;
    streak++;
    cursor = getDaysAgoDateString(1, new Date(`${cursor}T00:00:00`));
  }
  return streak;
}

export function computeWorkoutsThisWeek(
  workoutDates: Set<string>,
  last7Days: string[],
): number {
  return last7Days.filter((date) => workoutDates.has(date)).length;
}

/** Same grace-period logic as computeConsecutiveStreak, scored by threshold. */
export function computeNutritionStreak(
  nutritionScoreByDate: Map<string, number>,
  today: string,
  threshold: number,
  maxLookback = 60,
): number {
  const meetsThreshold = (date: string) => {
    const score = nutritionScoreByDate.get(date);
    return score !== undefined && score >= threshold;
  };

  let cursor = today;
  if (!meetsThreshold(cursor)) {
    cursor = getDaysAgoDateString(1, new Date(`${today}T00:00:00`));
  }

  let streak = 0;
  for (let i = 0; i < maxLookback; i++) {
    if (!meetsThreshold(cursor)) break;
    streak++;
    cursor = getDaysAgoDateString(1, new Date(`${cursor}T00:00:00`));
  }
  return streak;
}
