import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyReportView } from "./daily-report-view";
import { GenerateReportButton } from "./generate-report-button";
import type { AiDailyReport } from "@/lib/nightly-report/types";

interface ReportDayViewProps {
  report: AiDailyReport | null;
  isToday: boolean;
  date: string;
}

export function ReportDayView({ report, isToday, date }: ReportDayViewProps) {
  if (report) {
    return (
      <div className="flex flex-col gap-3">
        <DailyReportView report={report.parsed_json} />
        <Link
          href={`/log/${date}`}
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Edit meals &amp; workout for this day
        </Link>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>No report yet</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isToday ? (
          <>
            <p className="text-sm text-muted-foreground">
              A coach report generates automatically tonight. Want it sooner? Generate one now.
            </p>
            <GenerateReportButton date={date} reportHref="/report" label="Generate Nightly Report" />
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/report/import" />}
            >
              Already have a response? Import it
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              No report was generated for this day.
            </p>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/log/${date}`} />}
            >
              Log meals &amp; workout for this day
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
