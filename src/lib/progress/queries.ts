import { requireUser } from "@/lib/supabase/auth";
import type { AiDailyReport, AiReportJson } from "@/lib/nightly-report/types";

/** Reports between `startDate` and `endDate` (inclusive), oldest first. `ctx` lets callers outside a browser request (MCP, quick-log) inject an already-authenticated context instead of `requireUser()`. */
export async function getReportsInRange(
  startDate: string,
  endDate: string,
  ctx?: Awaited<ReturnType<typeof requireUser>>,
): Promise<AiDailyReport[]> {
  const { supabase, user } = ctx ?? (await requireUser());
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
