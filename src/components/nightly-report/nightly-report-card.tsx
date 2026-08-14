import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalDateString, getLocalHour } from "@/lib/date";
import { getAiReportForDate } from "@/lib/nightly-report/queries";
import { getCurrentUserTimeZone } from "@/lib/profile/queries";
import { ScoreBadge } from "./score-badge";

/** After this hour, a still-missing report reads as "you're about to lose today's context" rather than the default all-day empty state. */
const URGENT_HOUR = 20;

interface NightlyReportCardProps {
  loggedOn?: string;
}

export async function NightlyReportCard({ loggedOn }: NightlyReportCardProps = {}) {
  const timeZone = await getCurrentUserTimeZone();
  const today = getLocalDateString(new Date(), timeZone);
  const date = loggedOn ?? today;
  const isToday = date === today;
  const report = await getAiReportForDate(date);
  const reportHref = isToday ? "/report" : `/report/${date}`;
  const isUrgent = !report && isToday && getLocalHour(new Date(), timeZone) >= URGENT_HOUR;

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
            <p className={cn("text-sm", isUrgent ? "font-semibold text-warning" : "text-muted-foreground")}>
              {isUrgent
                ? "It's getting late and tonight's report hasn't generated yet — generate it now, or wait for the automatic nightly run."
                : "A coach report generates automatically tonight. Want it sooner? Generate one now to analyze in Claude, then import the results back."}
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
