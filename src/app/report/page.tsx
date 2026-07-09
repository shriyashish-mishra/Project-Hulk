import Link from "next/link";
import { ReportDayView } from "@/components/nightly-report/report-day-view";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";

export default async function ReportPage() {
  const loggedOn = getLocalDateString();
  const report = await getAiReportForDate(loggedOn);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Today&rsquo;s Report
        </h1>
        <p className="text-sm text-muted-foreground">{formatDateHeading()}</p>
      </div>

      <ReportDayView report={report} isToday />
    </div>
  );
}
