"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import type { Json } from "@/lib/supabase/database.types";
import { buildNightlyReportPrompt } from "./prompt";
import { getRecoveryPromptContext } from "./context";
import { getWeekSoFarContext } from "./week-context";
import { getRecentCalorieBalanceContext } from "./calorie-history";
import { getUserContext } from "@/lib/profile/context";
import { deriveMuscleMapModel } from "@/lib/profile/types";
import { calculateBMR, calculateStepsCaloriesBurned } from "@/lib/profile/targets";
import { parseAiReportResponse } from "./parse";
import { runNightlyReportPipeline } from "./generate";
import type { AiDailyReport, AiReportJson } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * On-demand counterpart to the nightly cron: same `runNightlyReportPipeline`,
 * just triggered by a click instead of a schedule, and authenticated via the
 * browser session (`requireUser()`) instead of the cron's service-role ctx.
 * Always overwrites — an explicit "Generate"/"Regenerate" click from the UI
 * should never be silently skipped the way the cron run is when a report
 * already exists.
 */
export async function generateReportNow(reportDate: string): Promise<AiDailyReport> {
  if (!DATE_PATTERN.test(reportDate)) {
    throw new Error("Invalid date.");
  }
  const auth = await requireUser();
  return runNightlyReportPipeline(reportDate, auth);
}

/** Parses, validates, and stores `reportDate`'s AI report from a pasted Claude response. */
export async function importAiReport(
  rawResponse: string,
  reportDate: string,
): Promise<AiDailyReport> {
  if (!rawResponse.trim()) {
    throw new Error("Paste the response from Claude first.");
  }
  if (!DATE_PATTERN.test(reportDate)) {
    throw new Error("Invalid date.");
  }

  const { supabase, user } = await requireUser();

  const [foodLogs, workoutLog, recoveryContext, userContext, weekSoFar, recentCalorieBalances] =
    await Promise.all([
      getFoodLogsForDate(reportDate),
      getWorkoutLogForDate(reportDate),
      getRecoveryPromptContext(reportDate),
      getUserContext(reportDate),
      getWeekSoFarContext(reportDate),
      getRecentCalorieBalanceContext(reportDate),
    ]);

  const bmr = calculateBMR({
    dateOfBirth: userContext.profile?.date_of_birth ?? null,
    biologicalSex: userContext.profile?.biological_sex ?? null,
    heightCm: userContext.profile?.height_cm ?? null,
    latestWeightKg: userContext.latestWeightKg,
  });
  // Structured input (workout_logs.non_workout_steps), not AI-parsed text —
  // see calculateStepsCaloriesBurned's doc.
  const stepsCaloriesKcal = calculateStepsCaloriesBurned(
    workoutLog?.non_workout_steps ?? null,
    userContext.latestWeightKg,
    userContext.profile?.height_cm ?? null,
  );
  const stepsInput =
    stepsCaloriesKcal !== null && workoutLog?.non_workout_steps
      ? { steps: workoutLog.non_workout_steps, caloriesBurned: stepsCaloriesKcal }
      : null;
  const parsed = parseAiReportResponse(rawResponse, bmr, stepsInput);
  // No automatic photo comparison — see runNightlyReportPipeline() for why.
  // If your pasted Claude response includes its own photo commentary
  // (because you attached photos directly in that chat), it just flows
  // through coach_summary/strengths naturally; there's no separate
  // structured note to inject here anymore.
  const promptMarkdown = buildNightlyReportPrompt({
    date: reportDate,
    foodLogs,
    workoutLog,
    stepsCaloriesBurned: stepsInput,
    ...recoveryContext,
    photoComparisonNote: null,
    userContext,
    weekSoFar,
    recentCalorieBalances,
  });

  // What mattered, as of today — so a later goal change never silently
  // reinterprets this already-generated report (see plan doc section 7).
  const profileSnapshot = userContext.profile
    ? {
        primary_goal: userContext.profile.primary_goal,
        protein_target_g: userContext.proteinTargetG,
        calorie_range_kcal: userContext.calorieRangeKcal,
        training_frequency: userContext.profile.training_frequency,
        muscle_map_model: deriveMuscleMapModel(userContext.profile.biological_sex),
      }
    : null;

  const { data, error } = await supabase
    .from("daily_ai_reports")
    .upsert(
      {
        user_id: user.id,
        report_date: reportDate,
        prompt_markdown: promptMarkdown,
        raw_response: rawResponse,
        parsed_json: parsed as unknown as Json,
        nutrition_score: parsed.nutrition_score,
        workout_score: parsed.workout_score,
        overall_score: parsed.overall_score,
        coach_summary: parsed.coach_summary,
        profile_snapshot: profileSnapshot as unknown as Json,
      },
      { onConflict: "user_id,report_date" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/report");
  revalidatePath(`/report/${reportDate}`);
  revalidatePath("/progress");
  // Workout Progress merges past reports' workout_exercises into its
  // history/trend/recommendation, so a newly imported report needs to
  // invalidate these too, not just the report/progress pages.
  revalidatePath("/workouts");
  revalidatePath("/workouts/history");
  revalidatePath("/workouts/progress");

  return { ...data, parsed_json: parsed as AiReportJson };
}
