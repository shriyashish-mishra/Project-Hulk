import { requireUser } from "@/lib/supabase/auth";
import { getDaysAgoDateString } from "@/lib/date";
import { getReportsInRange } from "@/lib/progress/queries";
import type { StreakSummary } from "./types";
import { computeConsecutiveStreak, computeNutritionStreak } from "./stats";

const NUTRITION_STREAK_THRESHOLD = 75;
const LOOKBACK_DAYS = 60;

async function getLoggedAndWorkoutDatesInRange(
  startDate: string,
  endDate: string,
): Promise<{ loggedDates: Set<string>; workoutDates: Set<string> }> {
  const { supabase, user } = await requireUser();
  const [foodResult, workoutResult] = await Promise.all([
    supabase
      .from("food_logs")
      .select("logged_on")
      .eq("user_id", user.id)
      .gte("logged_on", startDate)
      .lte("logged_on", endDate),
    supabase
      .from("workout_logs")
      .select("logged_on")
      .eq("user_id", user.id)
      .gte("logged_on", startDate)
      .lte("logged_on", endDate),
  ]);

  if (foodResult.error) throw new Error(foodResult.error.message);
  if (workoutResult.error) throw new Error(workoutResult.error.message);

  const workoutDates = new Set(workoutResult.data.map((row) => row.logged_on));

  const loggedDates = new Set(workoutDates);
  for (const row of foodResult.data) loggedDates.add(row.logged_on);

  return { loggedDates, workoutDates };
}

/** Dates with a food or workout log in range — used by the Monthly progress calendar. */
export async function getLoggedDatesInRange(
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  const { loggedDates } = await getLoggedAndWorkoutDatesInRange(startDate, endDate);
  return loggedDates;
}

export async function getStreakSummary(today: string): Promise<StreakSummary> {
  const rangeStart = getDaysAgoDateString(
    LOOKBACK_DAYS,
    new Date(`${today}T00:00:00`),
  );
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    getDaysAgoDateString(6 - i, new Date(`${today}T00:00:00`)),
  );

  const [{ loggedDates, workoutDates }, reports] = await Promise.all([
    getLoggedAndWorkoutDatesInRange(rangeStart, today),
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
