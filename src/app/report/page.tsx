import { BackLink } from "@/components/ui/back-link";
import { ReportDayView } from "@/components/nightly-report/report-day-view";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";
import { getCurrentUserTimeZone } from "@/lib/profile/queries";
import { requireOnboardedUser } from "@/lib/supabase/auth";

export default async function ReportPage() {
  await requireOnboardedUser();
  const timeZone = await getCurrentUserTimeZone();
  const loggedOn = getLocalDateString(new Date(), timeZone);
  const report = await getAiReportForDate(loggedOn);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Today&rsquo;s Report
        </h1>
        <p className="text-sm text-muted-foreground">{formatDateHeading(new Date(), timeZone)}</p>
      </div>

      <ReportDayView report={report} isToday date={loggedOn} />
    </div>
  );
}
