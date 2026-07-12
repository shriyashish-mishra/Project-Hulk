import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge } from "@/components/nightly-report/score-badge";
import { ScoreMeter } from "@/components/nightly-report/score-meter";
import type { AiReportJson } from "@/lib/nightly-report/types";

interface DailyScoreCardProps {
  report: AiReportJson;
}

export function DailyScoreCard({ report }: DailyScoreCardProps) {
  const hasRecovery = report.recovery_score !== undefined;

  return (
    <Card className="animate-fade-up">
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <ScoreBadge score={report.overall_score} size="lg" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Overall Score
            </span>
            <p className="text-xs text-muted-foreground">
              Blends your nutrition, workout, and recovery scores below into one
              number for the day.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <ScoreMeter label="Nutrition" score={report.nutrition_score} />
          <ScoreMeter label="Workout" score={report.workout_score} />
          {hasRecovery && <ScoreMeter label="Recovery" score={report.recovery_score!} />}
        </div>
        {hasRecovery && (
          <p className="text-xs text-muted-foreground">
            Recovery is the coach&rsquo;s 0-100 judgment of how well-recovered
            you likely are, based on training load, rest patterns, and
            today&rsquo;s hydration and sleep versus your targets — not a
            biometric reading (no HRV, no wearable data). Weight never
            factors into any score here; it&rsquo;s tracked separately on
            Progress.
          </p>
        )}
        {report.recovery_note && (
          <p className="text-xs text-muted-foreground">{report.recovery_note}</p>
        )}
      </CardContent>
    </Card>
  );
}
