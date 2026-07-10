import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge } from "@/components/nightly-report/score-badge";
import { ScoreMeter } from "@/components/nightly-report/score-meter";
import type { AiReportJson } from "@/lib/nightly-report/types";

interface DailyScoreCardProps {
  report: AiReportJson;
}

export function DailyScoreCard({ report }: DailyScoreCardProps) {
  return (
    <Card className="animate-fade-up">
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <ScoreBadge score={report.overall_score} size="lg" />
          <p className="text-sm text-muted-foreground">{report.coach_summary}</p>
        </div>
        <div className="flex flex-col gap-4">
          <ScoreMeter label="Nutrition" score={report.nutrition_score} />
          <ScoreMeter label="Workout" score={report.workout_score} />
        </div>
      </CardContent>
    </Card>
  );
}
