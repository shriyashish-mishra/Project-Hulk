import { Dumbbell, Flame, Sparkle } from "lucide-react";
import type { StreakSummary } from "@/lib/streaks/types";

interface StreakPillsProps {
  streaks: StreakSummary;
}

export function StreakPills({ streaks }: StreakPillsProps) {
  const pills = [
    streaks.loggingStreakDays > 0 && {
      key: "logging",
      icon: Flame,
      label: `${streaks.loggingStreakDays} day streak`,
    },
    streaks.workoutsThisWeek > 0 && {
      key: "workouts",
      icon: Dumbbell,
      label: `${streaks.workoutsThisWeek} workout${streaks.workoutsThisWeek === 1 ? "" : "s"} this week`,
    },
    streaks.nutritionStreakDays > 1 && {
      key: "nutrition",
      icon: Sparkle,
      label: `${streaks.nutritionStreakDays} day nutrition streak`,
    },
  ].filter(Boolean) as Array<{
    key: string;
    icon: typeof Flame;
    label: string;
  }>;

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 animate-fade-up">
      {pills.map(({ key, icon: Icon, label }) => (
        <div
          key={key}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground"
        >
          <Icon className="size-3.5 text-primary" />
          {label}
        </div>
      ))}
    </div>
  );
}
