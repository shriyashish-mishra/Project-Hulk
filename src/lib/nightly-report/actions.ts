"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import type { Json } from "@/lib/supabase/database.types";
import { buildNightlyReportPrompt } from "./prompt";
import { parseAiReportResponse } from "./parse";
import type { AiDailyReport, AiReportJson } from "./types";

/** Parses, validates, and stores today's AI report from a pasted Claude response. */
export async function importAiReport(rawResponse: string): Promise<AiDailyReport> {
  if (!rawResponse.trim()) {
    throw new Error("Paste the response from Claude first.");
  }

  const parsed = parseAiReportResponse(rawResponse);
  const reportDate = getLocalDateString();

  const [foodLogs, workoutLog] = await Promise.all([
    getFoodLogsForDate(reportDate),
    getWorkoutLogForDate(reportDate),
  ]);
  const promptMarkdown = buildNightlyReportPrompt({
    date: reportDate,
    foodLogs,
    workoutLog,
  });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_ai_reports")
    .upsert(
      {
        report_date: reportDate,
        prompt_markdown: promptMarkdown,
        raw_response: rawResponse,
        parsed_json: parsed as unknown as Json,
        nutrition_score: parsed.nutrition_score,
        workout_score: parsed.workout_score,
        overall_score: parsed.overall_score,
        coach_summary: parsed.coach_summary,
      },
      { onConflict: "report_date" },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/report");

  return { ...data, parsed_json: parsed as AiReportJson };
}
