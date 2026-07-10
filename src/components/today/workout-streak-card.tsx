import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatWeekdayShort } from "@/lib/date";
import type { RecentWorkoutDay } from "@/lib/streaks/types";

interface WorkoutStreakCardProps {
  workoutStreakDays: number;
  recentWorkoutDays: RecentWorkoutDay[];
}

export function WorkoutStreakCard({
  workoutStreakDays,
  recentWorkoutDays,
}: WorkoutStreakCardProps) {
  return (
    <Card className="animate-fade-up">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
            <Flame className="size-5" strokeWidth={2.5} />
          </span>
          {workoutStreakDays > 0 ? (
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {workoutStreakDays}
              <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                day workout streak
              </span>
            </p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">
              Workout streak
            </p>
          )}
        </div>

        <div className="flex justify-between gap-1.5">
          {recentWorkoutDays.map(({ date, trained }) => (
            <div key={date} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "size-2 rounded-full",
                  trained ? "bg-primary" : "bg-muted",
                )}
              />
              <span className="text-[10px] text-muted-foreground">
                {formatWeekdayShort(new Date(`${date}T00:00:00`))}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
