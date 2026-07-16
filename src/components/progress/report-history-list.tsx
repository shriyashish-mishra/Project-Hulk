import Link from "next/link";
import { formatShortDateWithWeekday } from "@/lib/date";
import type { AiDailyReport } from "@/lib/nightly-report/types";
import { ScoreBadge } from "@/components/nightly-report/score-badge";

interface ReportHistoryListProps {
  reports: AiDailyReport[];
}

export function ReportHistoryList({ reports }: ReportHistoryListProps) {
  if (reports.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reports yet — import your first nightly report to start building
        history.
      </p>
    );
  }

  const newestFirst = [...reports].reverse();

  return (
    <ul className="flex flex-col divide-y divide-border">
      {newestFirst.map((report) => (
        <li key={report.id}>
          <Link
            href={`/report/${report.report_date}`}
            className="flex items-center gap-3 py-2.5"
          >
            <ScoreBadge score={report.overall_score} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {formatShortDateWithWeekday(new Date(`${report.report_date}T00:00:00`))}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {report.coach_summary}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
