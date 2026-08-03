import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RecentExercise } from "@/lib/workout-sessions/exercise-progress";

interface ExercisePickerStripProps {
  exercises: RecentExercise[];
  /** Matched case-insensitively — a report-only exercise has no `exercise_id` to key by, so name is the one identifier every exercise always has. */
  selectedExerciseName: string;
}

/** Horizontal chip strip — every strength exercise ever completed or mentioned with a weight in a report, most recently trained first, selected one bordered mint. Plain links (`?exercise=name`) rather than client state, matching this page's server-rendered pattern. */
export function ExercisePickerStrip({ exercises, selectedExerciseName }: ExercisePickerStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {exercises.map((exercise) => {
        const selected = exercise.name.toLowerCase() === selectedExerciseName.toLowerCase();
        return (
          <Link
            key={exercise.name}
            href={`/workouts/progress?exercise=${encodeURIComponent(exercise.name)}`}
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
