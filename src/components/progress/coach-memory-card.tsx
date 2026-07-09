import { Sparkles } from "lucide-react";
import type { CoachInsight } from "@/lib/progress/types";

interface CoachMemoryCardProps {
  insights: CoachInsight[];
}

export function CoachMemoryCard({ insights }: CoachMemoryCardProps) {
  if (insights.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Log a few more days to start seeing week-over-week patterns.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {insights.map((insight, index) => (
        <li key={index} className="flex items-start gap-2 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>{insight.text}</span>
        </li>
      ))}
    </ul>
  );
}
