import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyReportView } from "./daily-report-view";
import type { AiDailyReport } from "@/lib/nightly-report/types";

interface ReportDayViewProps {
  report: AiDailyReport | null;
  isToday: boolean;
}

export function ReportDayView({ report, isToday }: ReportDayViewProps) {
  if (report) {
    return <DailyReportView report={report.parsed_json} />;
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
              Generate tonight&rsquo;s prompt, paste it into Claude, then import
              the response to see your coaching report here.
            </p>
            <Button nativeButton={false} render={<Link href="/report/generate" />}>
              Generate Nightly Report
            </Button>
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
          <p className="text-sm text-muted-foreground">
            No report was generated for this day.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
