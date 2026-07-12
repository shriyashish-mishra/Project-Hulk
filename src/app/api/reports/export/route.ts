import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/auth";
import { getReportsInRange } from "@/lib/progress/queries";
import { buildReportsCsv } from "@/lib/nightly-report/export";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  await requireUser();

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end || !DATE_PATTERN.test(start) || !DATE_PATTERN.test(end) || start > end) {
    return new NextResponse("Invalid date range.", { status: 400 });
  }

  const reports = await getReportsInRange(start, end);
  const csv = buildReportsCsv(reports);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="project-hulk-reports_${start}_to_${end}.csv"`,
    },
  });
}
