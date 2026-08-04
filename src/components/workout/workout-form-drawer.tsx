"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Bookmark, Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PresetPickerDrawer } from "@/components/presets/preset-picker-drawer";
import { ExerciseEntryDrawer, type ExerciseFieldValues } from "@/components/workout-templates/exercise-entry-drawer";
import { ExerciseLibraryPickerDrawer } from "@/components/workout-templates/exercise-library-picker-drawer";
import type { ExerciseLibraryItem } from "@/lib/exercise-library/types";
import type { WorkoutLog } from "@/lib/workout-logs/types";
import type { WorkoutPreset } from "@/lib/workout-presets/types";
import { parsePresetExercises } from "@/lib/workout-presets/format";

/**
 * Same block shape `parsePresetExercises` already reads (name line, then
 * detail lines) — so an exercise added through the structured picker
 * displays identically to one typed by hand or picked from a saved
 * preset. Reuses `ExerciseEntryDrawer`'s field values directly rather
 * than inventing a second shape for "a logged exercise."
 */
function formatExerciseBlock(exercise: ExerciseLibraryItem, values: ExerciseFieldValues): string {
  const lines = [exercise.name];
  if (exercise.category === "cardio") {
    if (values.durationMinutes != null) lines.push(`${values.durationMinutes} min`);
    const conditions = [
      values.inclinePercent != null ? `${values.inclinePercent}% incline` : null,
      values.speedKph != null ? `${values.speedKph}kph` : null,
    ].filter((part): part is string => part !== null);
    if (conditions.length > 0) lines.push(conditions.join(", "));
  } else {
    if (values.weight != null) lines.push(`${values.weight}${values.weightUnit ?? exercise.default_unit}`);
    if (values.sets != null && values.reps != null) lines.push(`${values.sets} x ${values.reps}`);
  }
  if (values.notes) lines.push(values.notes);
  return lines.join("\n");
}

const PLACEHOLDER =
  "Chest & Shoulders\n\nAround the World\n4kg\n4 x 12\n\nLateral Raises\n4kg\n4 x 12\n\nIncline Bench Press\n15kg\n4 x 10";

const MAX_PRESET_PREVIEW_LINES = 3;

/** Renders a saved workout the same way a generated report does — name left, detail (weight, sets x reps) muted-right — instead of a raw wall of text. */
function renderWorkoutPresetBody(rawText: string) {
  const lines = parsePresetExercises(rawText);
  const visible = lines.slice(0, MAX_PRESET_PREVIEW_LINES);
  const remaining = lines.length - visible.length;

  return (
    <div className="flex flex-col gap-0.5">
      {visible.map((line, index) => (
        <div key={index} className="flex items-baseline justify-between gap-3 text-[15px]">
          <span className="truncate text-foreground">{line.name}</span>
          {line.detail && (
            <span className="shrink-0 text-xs text-muted-foreground">{line.detail}</span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">+{remaining} more</span>
      )}
    </div>
  );
}

interface WorkoutFormDrawerProps {
  trigger: ReactElement;
  initialLog?: WorkoutLog | null;
  presets: WorkoutPreset[];
  exercises: ExerciseLibraryItem[];
  onSubmit: (rawText: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCreatePreset: (rawText: string) => Promise<WorkoutPreset>;
  onUpdatePreset: (id: string, rawText: string) => Promise<WorkoutPreset>;
  onDeletePreset: (id: string) => Promise<void>;
}

export function WorkoutFormDrawer({
  trigger,
  initialLog,
  presets,
  exercises,
  onSubmit,
  onDelete,
  onCreatePreset,
  onUpdatePreset,
  onDeletePreset,
}: WorkoutFormDrawerProps) {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Force the form body to remount with fresh state each time the
      // drawer opens, discarding any edits from a prior cancelled session.
      setSessionKey((key) => key + 1);
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <WorkoutFormBody
          key={sessionKey}
          initialLog={initialLog}
          presets={presets}
          exercises={exercises}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onCreatePreset={onCreatePreset}
          onUpdatePreset={onUpdatePreset}
          onDeletePreset={onDeletePreset}
          onDone={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

interface WorkoutFormBodyProps {
  initialLog?: WorkoutLog | null;
  presets: WorkoutPreset[];
  exercises: ExerciseLibraryItem[];
  onSubmit: (rawText: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCreatePreset: (rawText: string) => Promise<WorkoutPreset>;
  onUpdatePreset: (id: string, rawText: string) => Promise<WorkoutPreset>;
  onDeletePreset: (id: string) => Promise<void>;
  onDone: () => void;
}

function WorkoutFormBody({
  initialLog,
  presets,
  exercises,
  onSubmit,
  onDelete,
  onCreatePreset,
  onUpdatePreset,
  onDeletePreset,
  onDone,
}: WorkoutFormBodyProps) {
  const [rawText, setRawText] = useState(initialLog?.raw_text ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [enteringExercise, setEnteringExercise] = useState<ExerciseLibraryItem | null>(null);

  function handlePickPreset(presetText: string) {
    setRawText((prev) => (prev.trim() ? `${prev}\n${presetText}` : presetText));
  }

  function appendExerciseBlock(text: string) {
    setRawText((prev) => (prev.trim() ? `${prev}\n\n${text}` : text));
  }

  async function handleSaveExerciseEntry(values: ExerciseFieldValues) {
    if (!enteringExercise) return;
    appendExerciseBlock(formatExerciseBlock(enteringExercise, values));
    setEnteringExercise(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!rawText.trim()) {
      setError("Write your workout.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(rawText);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleClear() {
    if (!onDelete) return;
    setError(null);
    startTransition(async () => {
      try {
        await onDelete();
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to clear.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="flex-row items-center justify-between pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">
          Workout
        </DrawerTitle>
        <div className="flex items-center gap-3">
          <ExerciseLibraryPickerDrawer
            exercises={exercises}
            onPick={setEnteringExercise}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-semibold text-primary active:opacity-60"
              >
                <Plus className="size-3.5" />
                Add Exercise
              </button>
            }
          />
          <PresetPickerDrawer
            title="Saved workouts"
            emptyLabel="No saved workouts yet. Add the regimes you repeat often."
            addPlaceholder={PLACEHOLDER}
            presets={presets}
            onSelect={handlePickPreset}
            onCreate={onCreatePreset}
            onUpdate={onUpdatePreset}
            onDelete={onDeletePreset}
            renderPresetBody={renderWorkoutPresetBody}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-semibold text-primary active:opacity-60"
              >
                <Bookmark className="size-3.5" />
                Saved
              </button>
            }
          />
        </div>
      </DrawerHeader>

      <div className="flex flex-col gap-2 overflow-y-auto px-5 py-5">
        <Textarea
          autoFocus
          rows={8}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={PLACEHOLDER}
          className="min-h-56 resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use &ldquo;Add Exercise&rdquo; above for the same sets/reps/weight (or duration/incline for cardio) form
          Templates and Sessions use, or type/paste freely here.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter className="px-5 pb-6">
        <Button type="submit" disabled={isPending}>
          Save
        </Button>
        {initialLog && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isPending}
            onClick={handleClear}
          >
            Clear entry
          </Button>
        )}
      </DrawerFooter>

      <ExerciseEntryDrawer
        open={enteringExercise !== null}
        onOpenChange={(open) => !open && setEnteringExercise(null)}
        exercise={enteringExercise}
        showRest={false}
        onSave={handleSaveExerciseEntry}
      />
    </form>
  );
}
