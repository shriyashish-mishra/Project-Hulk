import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AiDailyReport, AiReportJson } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

export async function getAiReportForDate(
  reportDate: string,
  ctx?: AuthContext,
): Promise<AiDailyReport | null> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("daily_ai_reports")
    .select("*")
    .eq("user_id", user.id)
    .eq("report_date", reportDate)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return { ...data, parsed_json: data.parsed_json as unknown as AiReportJson };
}

/** Most recent reports, newest first — used by exercise-progress.ts's best-effort scan for a mention of a specific exercise. */
export async function getRecentAiReports(limit: number, ctx?: AuthContext): Promise<AiDailyReport[]> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("daily_ai_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("report_date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ ...row, parsed_json: row.parsed_json as unknown as AiReportJson }));
}
