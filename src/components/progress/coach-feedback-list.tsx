import { Star, TrendingUp, Target } from "lucide-react";

interface CoachFeedbackListProps {
  biggestWin: string | null;
  needsImprovement: string | null;
  tomorrowFocus: string;
}

export function CoachFeedbackList({
  biggestWin,
  needsImprovement,
  tomorrowFocus,
}: CoachFeedbackListProps) {
  const rows = [
    biggestWin && { icon: Star, label: "Biggest Win", text: biggestWin },
    needsImprovement && {
      icon: TrendingUp,
      label: "Needs Improvement",
      text: needsImprovement,
    },
    { icon: Target, label: "Tomorrow's Focus", text: tomorrowFocus },
  ].filter(Boolean) as Array<{ icon: typeof Star; label: string; text: string }>;

  return (
    <ul className="flex flex-col divide-y divide-border">
      {rows.map((row) => (
        <li key={row.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
            <row.icon className="size-4" />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-muted-foreground">
              {row.label}
            </span>
            <span className="text-sm text-foreground">{row.text}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
