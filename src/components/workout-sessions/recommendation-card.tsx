import { Badge } from "@/components/ui/badge";
import type { RecommendationConfidence, WeightRecommendation } from "@/lib/workout-sessions/exercise-progress";
import type { WeightUnit } from "@/lib/exercise-library/types";

const CONFIDENCE_VARIANT: Record<RecommendationConfidence, "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

interface RecommendationCardProps {
  recommendation: WeightRecommendation;
  unit: WeightUnit;
}

/** The next-weight call — same number the chart's projected point shows, plus the reasoning and how sure the app is. */
export function RecommendationCard({ recommendation, unit }: RecommendationCardProps) {
  const headline =
    recommendation.action === "increase" && recommendation.next_weight !== null
      ? `Increase to ${recommendation.next_weight}${unit} next session`
      : recommendation.next_weight !== null
        ? `Stay at ${recommendation.next_weight}${unit}`
        : "Not enough data yet";

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Next Weight Recommendation
      </span>
      <p className={recommendation.action === "increase" ? "text-lg font-bold text-primary" : "text-lg font-bold text-foreground"}>
        {headline}
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{recommendation.reason}</span>
        <Badge variant={CONFIDENCE_VARIANT[recommendation.confidence]}>
          {recommendation.confidence[0].toUpperCase() + recommendation.confidence.slice(1)} confidence
        </Badge>
      </div>
    </div>
  );
}
