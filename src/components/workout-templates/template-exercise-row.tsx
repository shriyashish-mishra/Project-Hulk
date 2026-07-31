import type { ReactNode } from "react";
import { Dumbbell, Waves } from "lucide-react";
import type { TemplateExercise } from "@/lib/workout-templates/types";

function formatDefaults(exercise: TemplateExercise): string {
  if (exercise.category === "cardio") {
    const parts: string[] = [];
    if (exercise.default_duration_minutes != null) parts.push(`${exercise.default_duration_minutes} min`);
    if (exercise.default_incline_percent != null) parts.push(`${exercise.default_incline_percent}%`);
    if (exercise.default_speed_kph != null) parts.push(`${exercise.default_speed_kph} kph`);
    return parts.length > 0 ? `Default ${parts.join(" · ")}` : "No defaults set";
  }

  const setsReps =
    exercise.default_sets != null && exercise.default_reps != null
      ? `${exercise.default_sets} × ${exercise.default_reps}`
      : null;
  const weight =
    exercise.default_weight != null ? `@ ${exercise.default_weight} ${exercise.default_weight_unit ?? ""}`.trim() : null;
  const parts = [setsReps, weight].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? `Default ${parts.join("  ")}` : "No defaults set";
}

interface TemplateExerciseRowProps {
  exercise: TemplateExercise;
  /** The kebab trigger element (an `ExerciseActionsDrawer`'s `trigger`) — kept as a slot so only this button, not the whole row, opens the actions drawer. */
  kebab: ReactNode;
}

/** The Template Editor's compact exercise card — icon, name, defaults caption, and a kebab slot for `ExerciseActionsDrawer`. */
export function TemplateExerciseRow({ exercise, kebab }: TemplateExerciseRowProps) {
  const isCardio = exercise.category === "cardio";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
            isCardio ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
          }`}
        >
          {isCardio ? <Waves className="size-4" /> : <Dumbbell className="size-4" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-foreground">{exercise.exercise_name}</p>
          <p className="text-xs text-muted-foreground">{formatDefaults(exercise)}</p>
        </div>
      </div>
      {kebab}
    </div>
  );
}
