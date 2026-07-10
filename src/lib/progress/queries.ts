import { requireUser } from "@/lib/supabase/auth";
import type { AiDailyReport, AiReportJson } from "@/lib/nightly-report/types";

/** Reports between `startDate` and `endDate` (inclusive), oldest first. */
export async function getReportsInRange(
  startDate: string,
  endDate: string,
): Promise<AiDailyReport[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("daily_ai_reports")
    .select("*")
    .eq("user_id", user.id)
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((row) => ({
    ...row,
    parsed_json: row.parsed_json as unknown as AiReportJson,
  }));
}
