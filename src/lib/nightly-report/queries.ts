import { requireUser } from "@/lib/supabase/auth";
import type { AiDailyReport, AiReportJson } from "./types";

export async function getAiReportForDate(
  reportDate: string,
): Promise<AiDailyReport | null> {
  const { supabase, user } = await requireUser();
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
