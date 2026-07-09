import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyReportView } from "@/components/nightly-report/daily-report-view";
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

      {report ? (
        <DailyReportView report={report.parsed_json} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No report yet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
