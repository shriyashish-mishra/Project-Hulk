"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { severityForScore } from "./severity";

interface ScoreMeterProps {
  label: string;
  score: number;
}

const INDICATOR_CLASSES = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
} as const;

export function ScoreMeter({ label, score }: ScoreMeterProps) {
  const severity = severityForScore(score);

  return (
    <ProgressPrimitive.Root value={score} className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">{score}</span>
      </div>
      <ProgressTrack>
        <ProgressIndicator className={cn(INDICATOR_CLASSES[severity])} />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}
