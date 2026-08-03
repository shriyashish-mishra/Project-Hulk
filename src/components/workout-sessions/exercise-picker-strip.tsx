import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RecentExercise } from "@/lib/workout-sessions/exercise-progress";

interface ExercisePickerStripProps {
  exercises: RecentExercise[];
  selectedExerciseId: string;
}

/** Horizontal chip strip — every strength exercise ever completed, most recently trained first, selected one bordered mint. Plain links (`?exercise=id`) rather than client state, matching this page's server-rendered pattern. */
export function ExercisePickerStrip({ exercises, selectedExerciseId }: ExercisePickerStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {exercises.map((exercise) => {
        const selected = exercise.exercise_id === selectedExerciseId;
        return (
          <Link
            key={exercise.exercise_id}
            href={`/workouts/progress?exercise=${exercise.exercise_id}`}
            className={cn(
              "shrink-0 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold transition-colors",
              selected
                ? "border-primary text-primary"
                : "border-border text-foreground hover:border-muted-foreground",
            )}
          >
            {exercise.name}
          </Link>
        );
      })}
    </div>
  );
}
