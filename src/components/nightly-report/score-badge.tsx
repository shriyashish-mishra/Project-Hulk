import { cn } from "@/lib/utils";
import { SEVERITY_LABEL, severityForScore } from "./severity";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "lg";
}

const SEVERITY_CLASSES = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

export function ScoreBadge({ score, size = "sm" }: ScoreBadgeProps) {
  const severity = severityForScore(score);

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-full border",
        size === "lg" ? "size-24 gap-0.5" : "size-11",
        SEVERITY_CLASSES[severity],
      )}
    >
      <span
        className={cn(
          "font-semibold tabular-nums",
          size === "lg" ? "text-3xl" : "text-sm",
        )}
      >
        {score}
      </span>
      {size === "lg" && (
        <span className="text-[11px] font-medium">{SEVERITY_LABEL[severity]}</span>
      )}
    </div>
  );
}
