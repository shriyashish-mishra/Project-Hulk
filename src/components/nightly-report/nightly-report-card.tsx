import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalDateString } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";
import { ScoreBadge } from "./score-badge";

interface NightlyReportCardProps {
  loggedOn?: string;
}

export async function NightlyReportCard({ loggedOn }: NightlyReportCardProps = {}) {
  const today = getLocalDateString();
  const date = loggedOn ?? today;
  const isToday = date === today;
  const report = await getAiReportForDate(date);
  const reportHref = isToday ? "/report" : `/report/${date}`;

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
            <Button nativeButton={false} render={<Link href={reportHref} />}>
              View full report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/report/generate?date=${date}`} />}
            >
              Regenerate Nightly Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/report/import?date=${date}`} />}
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
            <Button nativeButton={false} render={<Link href={`/report/generate?date=${date}`} />}>
              Generate Nightly Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/report/import?date=${date}`} />}
            >
              Already have a response? Import it
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
