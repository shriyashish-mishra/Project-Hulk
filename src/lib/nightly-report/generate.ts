import { revalidatePath } from "next/cache";
import type { Database, Json } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { getUserContextForCtx } from "@/lib/mcp/user-context";
import { deriveMuscleMapModel } from "@/lib/profile/types";
import { calculateBMR } from "@/lib/profile/targets";
import { generateNightlyReportText } from "@/lib/gemini/client";
import { buildNightlyReportPrompt } from "./prompt";
import { getRecoveryPromptContext } from "./context";
import { getWeekSoFarContext } from "./week-context";
import { getRecentCalorieBalanceContext } from "./calorie-history";
import { parseAiReportResponse } from "./parse";
import type { AiDailyReport, AiReportJson } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/**
 * The unattended equivalent of the manual generate-in-Claude-then-import
 * flow (`report/generate` + `importAiReport`): gathers the same context via
 * `buildNightlyReportPrompt`, but instead of a human copying that prompt
 * into Claude and pasting the reply back, calls Gemini directly and parses
 * its reply with the same `parseAiReportResponse` the manual import path
 * uses. Called by the nightly cron route with a service-role `ctx` — never
 * touches request cookies, so it has no browser-request dependency.
 */
export async function runNightlyReportPipeline(date: string, ctx: AuthContext): Promise<AiDailyReport> {
  const [foodLogs, workoutLog, recoveryContext, weekSoFar, userContext, recentCalorieBalances] = await Promise.all([
    getFoodLogsForDate(date, ctx),
    getWorkoutLogForDate(date, ctx),
    getRecoveryPromptContext(date, ctx),
    getWeekSoFarContext(date, ctx),
    getUserContextForCtx(ctx, date),
    getRecentCalorieBalanceContext(date, ctx),
  ]);

  // No automatic photo comparison here — Groq's vision free tier can't
  // reliably handle more than one view per day (its 8,000-tokens-per-minute
  // cap gets used up by a single comparison call), which broke on exactly
  // this user's normal capture pattern (front + side together). Same
  // stance as the MCP tool's gatherReportContext(): if photos matter for a
  // given night, attach them directly in a Claude conversation instead.
  const promptMarkdown = buildNightlyReportPrompt({
    date,
    foodLogs,
    workoutLog,
    ...recoveryContext,
    photoComparisonNote: null,
    userContext,
    weekSoFar,
    recentCalorieBalances,
    // Nobody reads the markdown report on this path — only parseAiReportResponse's
    // JSON extraction matters — and it was ~56% of a typical response, the
    // dominant factor in how long generation took. See BuildPromptInput's docs.
    includeMarkdownReport: false,
  });

  const rawResponse = await generateNightlyReportText(promptMarkdown);
  const bmr = calculateBMR({
    dateOfBirth: userContext.profile?.date_of_birth ?? null,
    biologicalSex: userContext.profile?.biological_sex ?? null,
    heightCm: userContext.profile?.height_cm ?? null,
    latestWeightKg: userContext.latestWeightKg,
  });
  const parsed = parseAiReportResponse(rawResponse, bmr);

  // What mattered, as of tonight — so a later goal change never silently
  // reinterprets this already-generated report (see importAiReport).
  const profileSnapshot = userContext.profile
    ? {
        primary_goal: userContext.profile.primary_goal,
        protein_target_g: userContext.proteinTargetG,
        calorie_range_kcal: userContext.calorieRangeKcal,
        training_frequency: userContext.profile.training_frequency,
        muscle_map_model: deriveMuscleMapModel(userContext.profile.biological_sex),
      }
    : null;

  const { data, error } = await ctx.supabase
    .from("daily_ai_reports")
    .upsert(
      {
        user_id: ctx.user.id,
        report_date: date,
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
  revalidatePath(`/report/${date}`);
  revalidatePath("/progress");
  // Workout Progress merges past reports' workout_exercises into its
  // history/trend/recommendation, so a newly generated report needs to
  // invalidate these too, not just the report/progress pages.
  revalidatePath("/workouts");
  revalidatePath("/workouts/history");
  revalidatePath("/workouts/progress");

  return { ...data, parsed_json: parsed as AiReportJson };
}
