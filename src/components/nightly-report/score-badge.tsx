import { cn } from "@/lib/utils";
import { SEVERITY_LABEL, SEVERITY_STROKE, severityForScore } from "./severity";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "lg";
}

const DIMENSIONS = {
  sm: { box: 44, stroke: 4, font: "text-sm" },
  lg: { box: 96, stroke: 6, font: "text-3xl" },
} as const;

/** WHOOP-style outline progress ring — color lives in the stroke only, never the number. */
export function ScoreBadge({ score, size = "sm" }: ScoreBadgeProps) {
  const severity = severityForScore(score);
  const { box, stroke, font } = DIMENSIONS[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative shrink-0" style={{ width: box, height: box }}>
      <svg width={box} height={box} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={SEVERITY_STROKE[severity]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-semibold text-foreground tabular-nums", font)}>
          {score}
        </span>
        {size === "lg" && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {SEVERITY_LABEL[severity]}
          </span>
        )}
      </div>
    </div>
  );
}
