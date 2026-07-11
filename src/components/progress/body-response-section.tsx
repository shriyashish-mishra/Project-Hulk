import type { WeightTrend } from "@/lib/progress/weight-trend";

interface BodyResponseSectionProps {
  weightTrend: WeightTrend;
  photoCount: number;
  periodLabel: string;
}

/** Shared by Weekly and Monthly — weight and photos are outcome signals, told together. */
export function BodyResponseSection({
  weightTrend,
  photoCount,
  periodLabel,
}: BodyResponseSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {weightTrend.hasData && weightTrend.latestKg !== null && (
        <div className="flex items-baseline justify-between rounded-2xl bg-muted p-3.5">
          <span className="text-xs text-muted-foreground">Latest weight</span>
          <span className="text-lg font-semibold text-foreground">
            {weightTrend.latestKg} kg
          </span>
        </div>
      )}
      <p className="text-sm text-muted-foreground">{weightTrend.sentence}</p>
      {photoCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {photoCount} progress photo{photoCount > 1 ? "s" : ""} captured this {periodLabel}.
        </p>
      )}
    </div>
  );
}
