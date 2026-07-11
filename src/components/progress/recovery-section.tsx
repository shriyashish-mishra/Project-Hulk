import { formatDuration } from "@/lib/date";

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-muted p-3.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-foreground">{value}</span>
    </div>
  );
}

interface RecoverySectionProps {
  avgSleepMinutes: number | null;
  hydrationTargetHitDays: number;
  totalDaysWithWater: number;
  insights: string[];
}

/** Shared by Weekly ("How You Recovered") and Monthly — sleep and hydration told together, not as separate widgets. */
export function RecoverySection({
  avgSleepMinutes,
  hydrationTargetHitDays,
  totalDaysWithWater,
  insights,
}: RecoverySectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Tile
          label="Avg sleep"
          value={avgSleepMinutes !== null ? formatDuration(avgSleepMinutes) : "—"}
        />
        <Tile
          label="Hydration"
          value={
            totalDaysWithWater > 0
              ? `${hydrationTargetHitDays}/${totalDaysWithWater} on target`
              : "—"
          }
        />
      </div>
      {insights.length > 0 && (
        <div className="flex flex-col gap-2">
          {insights.map((insight, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {insight}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
