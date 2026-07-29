"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

interface NutrientBarProps {
  label: string;
  value: number;
  unit: string;
  /** A real target (from lib/profile/targets.ts) — when present, the bar fills toward this and the caption reads "value / target" instead of a vague fraction of your own history. */
  target: number | null;
  /** Trailing 7-day average — still shown as a small secondary line when available, target or not. */
  avg: number | null;
}

export function NutrientBar({ label, value, unit, target, avg }: NutrientBarProps) {
  const max = target ?? Math.max(value, avg ?? 0, 1) * 1.15;
  const delta = avg === null ? null : Math.round(value - avg);

  return (
    <ProgressPrimitive.Root value={value} max={max} className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {value}
          <span className="ml-0.5 text-xs">{unit}</span>
          {target !== null && (
            <span className="ml-1 text-xs text-muted-foreground/70">
              / {target}
              {unit} target
            </span>
          )}
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
