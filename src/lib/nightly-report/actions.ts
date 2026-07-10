"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import type { Json } from "@/lib/supabase/database.types";
import { buildNightlyReportPrompt } from "./prompt";
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

  const [foodLogs, workoutLog] = await Promise.all([
    getFoodLogsForDate(reportDate),
    getWorkoutLogForDate(reportDate),
  ]);
  const promptMarkdown = buildNightlyReportPrompt({
    date: reportDate,
    foodLogs,
    workoutLog,
  });

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
