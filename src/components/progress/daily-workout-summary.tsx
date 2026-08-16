import { Dumbbell } from "lucide-react";
import { MuscleMap } from "./anatomy/MuscleMap";
import { computeMuscleGroupIntensity } from "@/lib/progress/muscle-groups";
import type { WorkoutExercise } from "@/lib/nightly-report/types";
import type { MuscleMapModel } from "@/lib/profile/types";

interface DailyWorkoutSummaryProps {
  musclesTrained: string[];
  workoutNote: string | null;
  durationMin?: number;
  caloriesBurned?: number;
  exercises?: WorkoutExercise[];
  muscleMapModel?: MuscleMapModel;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-lg font-semibold text-foreground tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function DailyWorkoutSummary({
  musclesTrained,
  workoutNote,
  durationMin,
  caloriesBurned,
  exercises,
  muscleMapModel,
}: DailyWorkoutSummaryProps) {
  const trained = musclesTrained.length > 0;
  const hasExercises = (exercises?.length ?? 0) > 0;
  const hasStats = durationMin !== undefined || caloriesBurned !== undefined || hasExercises;

  // A rest day trains no muscle (musclesTrained stays empty by design — see
  // the nightly-report prompt), but can still carry real numbers: logged
  // non-workout steps burn calories same as any other day. Only fall back
  // to the plain text line when there's truly nothing to show (no muscles
  // AND no stats) — a rest day with steps logged still gets the full
  // stats/exercises treatment below, just without "Workout completed" or
  // a muscle map, since nothing was actually trained.
  if (!trained && !hasStats) {
    return (
      <p className="text-sm text-muted-foreground">
        {workoutNote ? "Rest day. " : "No workout logged. "}
        {workoutNote}
      </p>
    );
  }

  const intensity = trained ? computeMuscleGroupIntensity([musclesTrained]) : {};

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
          <Dumbbell className="size-5" />
        </span>
        <p className="text-sm font-medium text-foreground">
          {trained ? "Workout completed" : "Rest day"}
        </p>
      </div>

      {hasStats && (
        <div className="flex gap-6 rounded-2xl bg-muted p-3.5">
          {durationMin !== undefined && (
            <StatTile label="Duration" value={`${durationMin} min`} />
          )}
          {caloriesBurned !== undefined && (
            <StatTile label="Calories burned" value={`${caloriesBurned} kcal`} />
          )}
          {hasExercises && <StatTile label="Exercises" value={`${exercises!.length}`} />}
        </div>
      )}

      {trained && <MuscleMap intensity={intensity} model={muscleMapModel} />}

      {hasExercises && (
        <ul className="flex flex-col divide-y divide-border">
          {exercises!.map((exercise, index) => (
            <li
              key={index}
              className="flex items-baseline justify-between gap-3 py-2 text-sm"
            >
              <span className="text-foreground">{exercise.name}</span>
              {(exercise.detail || exercise.calories_burned !== undefined) && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {[exercise.detail, exercise.calories_burned !== undefined ? `${exercise.calories_burned} kcal` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {workoutNote && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">{workoutNote}</p>
      )}
    </div>
  );
}
