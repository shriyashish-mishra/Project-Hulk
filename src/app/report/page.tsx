import { BackLink } from "@/components/ui/back-link";
import { ReportDayView } from "@/components/nightly-report/report-day-view";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";

export default async function ReportPage() {
  const loggedOn = getLocalDateString();
  const report = await getAiReportForDate(loggedOn);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Today&rsquo;s Report
        </h1>
        <p className="text-sm text-muted-foreground">{formatDateHeading()}</p>
      </div>

      <ReportDayView report={report} isToday />
    </div>
  );
}
