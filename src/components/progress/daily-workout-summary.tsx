import { Dumbbell } from "lucide-react";
import { MuscleMapFigure } from "./muscle-map-figure";
import { computeRegionCounts } from "@/lib/progress/muscle-map";

interface DailyWorkoutSummaryProps {
  musclesTrained: string[];
  workoutNote: string | null;
}

export function DailyWorkoutSummary({
  musclesTrained,
  workoutNote,
}: DailyWorkoutSummaryProps) {
  if (musclesTrained.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {workoutNote ? "Rest day. " : "No workout logged. "}
        {workoutNote}
      </p>
    );
  }

  const regionCounts = computeRegionCounts([musclesTrained]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
          <Dumbbell className="size-5" />
        </span>
        <p className="text-sm font-medium text-foreground">Workout completed</p>
      </div>
      <MuscleMapFigure regionCounts={regionCounts} />
      {workoutNote && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {workoutNote}
        </p>
      )}
    </div>
  );
}
