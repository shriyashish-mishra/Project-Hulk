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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {pills.map(({ key, icon: Icon, label }) => (
        <div key={key} className="flex items-center gap-1.5">
          <Icon className="size-3.5 text-primary" strokeWidth={2.5} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
