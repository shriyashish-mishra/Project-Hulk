import { Check, Dumbbell, Plus, Star, TrendingDown, TrendingUp, Waves } from "lucide-react";
import type { ExerciseCategory } from "@/lib/exercise-library/types";
import { cn } from "@/lib/utils";
import type { SessionWeightSuggestion } from "@/lib/workout-sessions/exercise-progress";
import type { SessionExercise } from "@/lib/workout-sessions/types";

interface SessionExerciseCardProps {
  exerciseName: string;
  category: ExerciseCategory;
  /** One or more rows sharing this exercise — more than one means the user logged separate weight/rep groups (e.g. a drop set) for the same exercise this session. */
  entries: SessionExercise[];
  onPressField: (entry: SessionExercise) => void;
  onToggleSet: (entry: SessionExercise, setIndex: number) => void;
  /** Renders the field chips and set dots as plain, non-interactive elements — the completed-session detail view reuses this card without letting anything be edited. */
  readOnly?: boolean;
  /** Keyed by session_exercise id — present when that specific entry's pre-filled weight is a Hulk-computed bump/ease from last time. */
  weightSuggestions?: Record<string, SessionWeightSuggestion>;
  /** Reverts both this session's weight and the template's default back to `previousWeight` — a one-tap "no, keep it at X" for when the heuristic misfires. */
  onRevertSuggestion?: (entry: SessionExercise, previousWeight: number) => void;
  /** Appends another weight/rep (or duration/incline/speed) variation for this same exercise — how a drop set or a second cardio interval gets logged. */
  onAddEntry?: () => void;
  /** Pushes this exercise's current weight/reps (or, if it wasn't on the template at all, the whole entry) into the template's defaults — on-demand only, never implicit. Absent (not just disabled) when this session has no template to update, or is read-only. */
  onSetDefault?: () => void;
  /** True right after `onSetDefault` succeeds — swaps the button for a brief confirmation instead of a toast (no toast infra in this app). */
  isSavedAsDefault?: boolean;
}

function FieldChip({ label, value, suffix }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-xl bg-muted px-3 py-2">
      <span className="text-[9.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{label}</span>
      <span className="text-[15px] font-bold text-foreground">{value != null ? `${value}${suffix ?? ""}` : "—"}</span>
    </div>
  );
}

function SetDot({ done, onClick, readOnly = false }: { done: boolean; onClick: () => void; readOnly?: boolean }) {
  return (
    <button
      type="button"
      onClick={readOnly ? undefined : onClick}
      disabled={readOnly}
      aria-label={done ? "Mark set incomplete" : "Mark set complete"}
      className={cn(
        "flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
        done ? "border-primary bg-primary" : "border-border bg-transparent",
        readOnly && "pointer-events-none",
      )}
    >
      {done && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
    </button>
  );
}

function EntryRow({
  entry,
  entryLabel,
  isCardio,
  onPressField,
  onToggleSet,
  readOnly,
  weightSuggestion,
  onRevertSuggestion,
}: {
  entry: SessionExercise;
  entryLabel?: string;
  isCardio: boolean;
  onPressField: () => void;
  onToggleSet: (setIndex: number) => void;
  readOnly: boolean;
  weightSuggestion?: SessionWeightSuggestion;
  onRevertSuggestion?: (previousWeight: number) => void;
}) {
  const setsPlanned = entry.sets_planned ?? 0;

  return (
    <div className="flex flex-col gap-2">
      {entryLabel && <span className="text-[11px] font-semibold text-muted-foreground">{entryLabel}</span>}

      {weightSuggestion && (
        <div
          className={cn(
            "flex w-fit items-center gap-1.5 rounded-full py-0.5 pr-1 pl-2 text-[11px] font-semibold",
            weightSuggestion.action === "increase" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning",
          )}
        >
          {weightSuggestion.action === "increase" ? (
            <TrendingUp className="size-3 shrink-0" />
          ) : (
            <TrendingDown className="size-3 shrink-0" />
          )}
          <span>Hulk suggests {weightSuggestion.action === "increase" ? "increasing" : "decreasing"} weight</span>
          {onRevertSuggestion && (
            <button
              type="button"
              onClick={() => onRevertSuggestion(weightSuggestion.previous_weight)}
              className="shrink-0 rounded-full bg-background/60 px-1.5 py-0.5 text-[10px] font-bold underline-offset-2 active:opacity-60"
            >
              Undo
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={readOnly ? undefined : onPressField}
        disabled={readOnly}
        className={cn("flex gap-2 text-left active:opacity-70", readOnly && "pointer-events-none")}
      >
        {isCardio ? (
          <>
            <FieldChip label="Min" value={entry.duration_minutes} />
            <FieldChip label="Incline" value={entry.incline_percent} suffix="%" />
            <FieldChip label="Kph" value={entry.speed_kph} />
          </>
        ) : (
          <>
            <FieldChip label="Weight" value={entry.weight} suffix={entry.weight != null ? ` ${entry.weight_unit ?? ""}` : ""} />
            <FieldChip label="Reps" value={entry.reps} />
          </>
        )}
      </button>

      {isCardio ? (
        <div className="flex">
          <SetDot done={entry.sets_completed > 0} onClick={() => onToggleSet(0)} readOnly={readOnly} />
        </div>
      ) : (
        setsPlanned > 0 && (
          <div className="flex gap-1.5">
            {Array.from({ length: setsPlanned }, (_, index) => (
              <SetDot key={index} done={index < entry.sets_completed} onClick={() => onToggleSet(index)} readOnly={readOnly} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

/**
 * Screen 3's per-exercise card. Usually one entry, but renders every entry
 * sharing this exercise as its own weight/reps/set-dots block within a
 * single card — how a drop set (e.g. 10kg x2x8 then 7.5kg x2x10 on the same
 * Bicep Curl) gets logged, instead of two visually-identical cards.
 */
export function SessionExerciseCard({
  exerciseName,
  category,
  entries,
  onPressField,
  onToggleSet,
  readOnly = false,
  weightSuggestions = {},
  onRevertSuggestion,
  onAddEntry,
  onSetDefault,
  isSavedAsDefault = false,
}: SessionExerciseCardProps) {
  const isCardio = category === "cardio";
  const totalPlanned = entries.reduce((sum, entry) => sum + (entry.sets_planned ?? 0), 0);
  const totalCompleted = entries.reduce((sum, entry) => sum + entry.sets_completed, 0);
  const isDone = isCardio
    ? entries.every((entry) => entry.sets_completed > 0)
    : totalPlanned > 0 && totalCompleted >= totalPlanned;
  const showEntryLabels = entries.length > 1;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              isCardio ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary",
            )}
          >
            {isCardio ? <Waves className="size-4" /> : <Dumbbell className="size-4" />}
          </span>
          <span className="min-w-0 flex-1 text-[15px] font-semibold break-words text-foreground">{exerciseName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onSetDefault &&
            (isSavedAsDefault ? (
              <span className="text-[11px] font-semibold text-primary">Saved</span>
            ) : (
              <button
                type="button"
                onClick={onSetDefault}
                aria-label="Set as template default"
                className="text-muted-foreground active:opacity-60"
              >
                <Star className="size-4" />
              </button>
            ))}
          {!isCardio && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                isDone ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {totalCompleted}/{totalPlanned}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {entries.map((entry, index) => (
          <EntryRow
            key={entry.id}
            entry={entry}
            entryLabel={showEntryLabels ? `Variation ${index + 1} of ${entries.length}` : undefined}
            isCardio={isCardio}
            onPressField={() => onPressField(entry)}
            onToggleSet={(setIndex) => onToggleSet(entry, setIndex)}
            readOnly={readOnly}
            weightSuggestion={weightSuggestions[entry.id]}
            onRevertSuggestion={onRevertSuggestion ? (previousWeight) => onRevertSuggestion(entry, previousWeight) : undefined}
          />
        ))}
      </div>

      {!readOnly && onAddEntry && (
        <button
          type="button"
          onClick={onAddEntry}
          className="flex items-center gap-1 self-start text-[11px] font-medium text-muted-foreground active:opacity-60"
        >
          <Plus className="size-3" />
          Variation
        </button>
      )}
    </div>
  );
}
