import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportDayView } from "@/components/nightly-report/report-day-view";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ReportDatePageProps {
  params: Promise<{ date: string }>;
}

export default async function ReportDatePage({ params }: ReportDatePageProps) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) notFound();

  const today = getLocalDateString();
  const isToday = date === today;
  const report = await getAiReportForDate(date);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href="/progress"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {isToday ? "Today's Report" : "Report"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDateHeading(new Date(`${date}T00:00:00`))}
        </p>
      </div>

      <ReportDayView report={report} isToday={isToday} />
    </div>
  );
}
