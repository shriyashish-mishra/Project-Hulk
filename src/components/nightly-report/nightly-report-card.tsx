import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalDateString } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";
import { ScoreBadge } from "./score-badge";

export async function NightlyReportCard() {
  const loggedOn = getLocalDateString();
  const report = await getAiReportForDate(loggedOn);

  return (
    <Card className="animate-fade-up" style={{ animationDelay: "300ms" }}>
      <CardHeader>
        <CardTitle>Coach report</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {report ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3.5">
              <ScoreBadge score={report.overall_score} />
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {report.coach_summary}
              </p>
            </div>
            <Button nativeButton={false} render={<Link href="/report" />}>
              View full report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/report/import" />}
            >
              Re-import a new response
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Generate a report to analyze in Claude, then import the results
              back once ready.
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
        )}
      </CardContent>
    </Card>
  );
}
