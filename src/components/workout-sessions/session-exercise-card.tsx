import { Check, Dumbbell, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionExercise } from "@/lib/workout-sessions/types";

interface SessionExerciseCardProps {
  exercise: SessionExercise;
  onPressField: () => void;
  onToggleSet: (setIndex: number) => void;
}

function FieldChip({ label, value, suffix }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-xl bg-muted px-3 py-2">
      <span className="text-[9.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{label}</span>
      <span className="text-[15px] font-bold text-foreground">{value != null ? `${value}${suffix ?? ""}` : "—"}</span>
    </div>
  );
}

function SetDot({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={done ? "Mark set incomplete" : "Mark set complete"}
      className={cn(
        "flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
        done ? "border-primary bg-primary" : "border-border bg-transparent",
      )}
    >
      {done && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
    </button>
  );
}

/** Screen 3's per-exercise card — editable weight/reps (or duration/incline/speed) and tappable set-completion dots. Cardio exercises get a single dot standing in for "done." */
export function SessionExerciseCard({ exercise, onPressField, onToggleSet }: SessionExerciseCardProps) {
  const isCardio = exercise.category === "cardio";
  const setsPlanned = exercise.sets_planned ?? 0;
  const isDone = isCardio ? exercise.sets_completed > 0 : setsPlanned > 0 && exercise.sets_completed >= setsPlanned;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              isCardio ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary",
            )}
          >
            {isCardio ? <Waves className="size-4" /> : <Dumbbell className="size-4" />}
          </span>
          <span className="text-[15px] font-semibold text-foreground">{exercise.exercise_name}</span>
        </div>
        {!isCardio && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-bold",
              isDone ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            {exercise.sets_completed}/{setsPlanned}
          </span>
        )}
      </div>

      <button type="button" onClick={onPressField} className="flex gap-2 text-left active:opacity-70">
        {isCardio ? (
          <>
            <FieldChip label="Min" value={exercise.duration_minutes} />
            <FieldChip label="Incline" value={exercise.incline_percent} suffix="%" />
            <FieldChip label="Kph" value={exercise.speed_kph} />
          </>
        ) : (
          <>
            <FieldChip label="Weight" value={exercise.weight} suffix={exercise.weight != null ? ` ${exercise.weight_unit ?? ""}` : ""} />
            <FieldChip label="Reps" value={exercise.reps} />
          </>
        )}
      </button>

      {isCardio ? (
        <div className="flex">
          <SetDot done={exercise.sets_completed > 0} onClick={() => onToggleSet(0)} />
        </div>
      ) : (
        setsPlanned > 0 && (
          <div className="flex gap-1.5">
            {Array.from({ length: setsPlanned }, (_, index) => (
              <SetDot key={index} done={index < exercise.sets_completed} onClick={() => onToggleSet(index)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
