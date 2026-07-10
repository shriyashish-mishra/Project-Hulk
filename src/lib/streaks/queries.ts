import { createClient } from "@/lib/supabase/server";
import { getDaysAgoDateString } from "@/lib/date";
import { getReportsInRange } from "@/lib/progress/queries";
import type { StreakSummary } from "./types";
import { computeConsecutiveStreak, computeNutritionStreak } from "./stats";

const NUTRITION_STREAK_THRESHOLD = 75;
const LOOKBACK_DAYS = 60;

async function getLoggedDatesInRange(
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const [foodResult, workoutResult] = await Promise.all([
    supabase
      .from("food_logs")
      .select("logged_on")
      .gte("logged_on", startDate)
      .lte("logged_on", endDate),
    supabase
      .from("workout_logs")
      .select("logged_on")
      .gte("logged_on", startDate)
      .lte("logged_on", endDate),
  ]);

  if (foodResult.error) throw new Error(foodResult.error.message);
  if (workoutResult.error) throw new Error(workoutResult.error.message);

  const dates = new Set<string>();
  for (const row of foodResult.data) dates.add(row.logged_on);
  for (const row of workoutResult.data) dates.add(row.logged_on);
  return dates;
}

async function getWorkoutDatesInRange(
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_logs")
    .select("logged_on")
    .gte("logged_on", startDate)
    .lte("logged_on", endDate);

  if (error) throw new Error(error.message);
  return new Set(data.map((row) => row.logged_on));
}

export async function getStreakSummary(today: string): Promise<StreakSummary> {
  const rangeStart = getDaysAgoDateString(
    LOOKBACK_DAYS,
    new Date(`${today}T00:00:00`),
  );
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    getDaysAgoDateString(6 - i, new Date(`${today}T00:00:00`)),
  );

  const [loggedDates, workoutDates, reports] = await Promise.all([
    getLoggedDatesInRange(rangeStart, today),
    getWorkoutDatesInRange(rangeStart, today),
    getReportsInRange(rangeStart, today),
  ]);

  const nutritionScoreByDate = new Map(
    reports.map((report) => [report.report_date, report.nutrition_score]),
  );

  return {
    loggingStreakDays: computeConsecutiveStreak(loggedDates, today),
    workoutStreakDays: computeConsecutiveStreak(workoutDates, today),
    nutritionStreakDays: computeNutritionStreak(
      nutritionScoreByDate,
      today,
      NUTRITION_STREAK_THRESHOLD,
    ),
    recentWorkoutDays: last7Days.map((date) => ({
      date,
      trained: workoutDates.has(date),
    })),
  };
}
