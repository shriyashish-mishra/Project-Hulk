"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

interface NutrientBarProps {
  label: string;
  value: number;
  unit: string;
  /** Trailing 7-day average, for a "vs your recent average" caption instead of a fixed goal. */
  avg: number | null;
}

export function NutrientBar({ label, value, unit, avg }: NutrientBarProps) {
  const max = Math.max(value, avg ?? 0, 1) * 1.15;
  const delta = avg === null ? null : Math.round(value - avg);

  return (
    <ProgressPrimitive.Root value={value} max={max} className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {value}
          <span className="ml-0.5 text-xs">{unit}</span>
        </span>
      </div>
      <ProgressTrack>
        <ProgressIndicator className="bg-primary" />
      </ProgressTrack>
      {delta !== null && (
        <span className="text-xs text-muted-foreground">
          {delta === 0
            ? "On par with your 7-day average"
            : `${delta > 0 ? "+" : ""}${delta}${unit} vs 7-day average`}
        </span>
      )}
    </ProgressPrimitive.Root>
  );
}
