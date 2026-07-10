import { Target } from "lucide-react";
import type { WorkoutExercise } from "@/lib/nightly-report/types";

interface NextDayPlanCardProps {
  tomorrowWorkout: string;
  exercises?: WorkoutExercise[];
}

export function NextDayPlanCard({ tomorrowWorkout, exercises }: NextDayPlanCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
          <Target className="size-4" />
        </span>
        <p className="text-sm text-foreground">{tomorrowWorkout}</p>
      </div>
      {exercises && exercises.length > 0 && (
        <ul className="flex flex-col divide-y divide-border">
          {exercises.map((exercise, index) => (
            <li
              key={index}
              className="flex items-baseline justify-between gap-3 py-2 text-sm"
            >
              <span className="text-foreground">{exercise.name}</span>
              {exercise.detail && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {exercise.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
