import { MuscleMapFigure } from "./muscle-map-figure";
import {
  ALL_MUSCLE_REGIONS,
  MUSCLE_REGION_LABEL,
  type MuscleRegion,
} from "@/lib/progress/muscle-map";

function DistributionRow({
  label,
  count,
  maxCount,
}: {
  label: string;
  count: number;
  maxCount: number;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-4 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {count}
      </span>
    </div>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

interface MuscleBalanceSectionProps {
  regionCounts: Map<MuscleRegion, number>;
  distributionLabel: string;
}

export function MuscleBalanceSection({
  regionCounts,
  distributionLabel,
}: MuscleBalanceSectionProps) {
  const ranked = [...ALL_MUSCLE_REGIONS].sort(
    (a, b) => (regionCounts.get(b) ?? 0) - (regionCounts.get(a) ?? 0),
  );
  const maxCount = Math.max(1, ...Array.from(regionCounts.values()));

  const trainedRegions = ranked.filter((r) => (regionCounts.get(r) ?? 0) > 0);
  const mostTrained =
    trainedRegions.length > 0 ? MUSCLE_REGION_LABEL[trainedRegions[0]] : null;
  const leastTrained =
    trainedRegions.length > 0
      ? MUSCLE_REGION_LABEL[trainedRegions[trainedRegions.length - 1]]
      : null;
  const neglected = ranked
    .filter((r) => (regionCounts.get(r) ?? 0) === 0)
    .map((r) => MUSCLE_REGION_LABEL[r]);
  const recoveryBalance =
    neglected.length === 0 ? "Well balanced" : neglected.length <= 2 ? "Good" : "Needs attention";

  return (
    <div className="flex flex-col gap-6">
      <MuscleMapFigure regionCounts={regionCounts} size="lg" className="py-2" />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {distributionLabel}
        </span>
        <div className="flex flex-col gap-2.5 pt-1">
          {ranked.map((region) => (
            <DistributionRow
              key={region}
              label={MUSCLE_REGION_LABEL[region]}
              count={regionCounts.get(region) ?? 0}
              maxCount={maxCount}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <InsightRow label="Most Trained" value={mostTrained ?? "—"} />
        <InsightRow label="Least Trained" value={leastTrained ?? "—"} />
        <InsightRow label="Neglected" value={neglected.length > 0 ? neglected.join(", ") : "None"} />
        <InsightRow label="Recovery Balance" value={recoveryBalance} />
      </div>
    </div>
  );
}
