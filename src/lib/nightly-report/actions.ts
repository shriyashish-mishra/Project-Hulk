"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import type { Json } from "@/lib/supabase/database.types";
import { buildNightlyReportPrompt } from "./prompt";
import { getRecoveryPromptContext } from "./context";
import { getUserContext } from "@/lib/profile/context";
import { deriveMuscleMapModel } from "@/lib/profile/types";
import { parseAiReportResponse } from "./parse";
import type { AiDailyReport, AiReportJson } from "./types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

  const parsed = parseAiReportResponse(rawResponse);

  const { supabase, user } = await requireUser();

  const [foodLogs, workoutLog, recoveryContext, userContext] = await Promise.all([
    getFoodLogsForDate(reportDate),
    getWorkoutLogForDate(reportDate),
    getRecoveryPromptContext(reportDate),
    getUserContext(),
  ]);
  const promptMarkdown = buildNightlyReportPrompt({
    date: reportDate,
    foodLogs,
    workoutLog,
    ...recoveryContext,
    userContext,
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

  return { ...data, parsed_json: parsed as AiReportJson };
}
