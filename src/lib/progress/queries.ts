import { createClient } from "@/lib/supabase/server";
import type { AiDailyReport, AiReportJson } from "@/lib/nightly-report/types";

/** Reports between `startDate` and `endDate` (inclusive), oldest first. */
export async function getReportsInRange(
  startDate: string,
  endDate: string,
): Promise<AiDailyReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_ai_reports")
    .select("*")
    .gte("report_date", startDate)
    .lte("report_date", endDate)
    .order("report_date", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((row) => ({
    ...row,
    parsed_json: row.parsed_json as unknown as AiReportJson,
  }));
}
