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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PresetPickerDrawer } from "@/components/presets/preset-picker-drawer";
import { ExerciseEntryDrawer, type ExerciseFieldValues } from "@/components/workout-templates/exercise-entry-drawer";
import { ExerciseLibraryPickerDrawer } from "@/components/workout-templates/exercise-library-picker-drawer";
import type { ExerciseLibraryItem } from "@/lib/exercise-library/types";
import { countMatchingWorkoutLogs } from "@/lib/workout-logs/actions";
import type { WorkoutLog } from "@/lib/workout-logs/types";
import type { WorkoutPreset } from "@/lib/workout-presets/types";
import { parsePresetExercises } from "@/lib/workout-presets/format";

/** Below this, "you've logged this a few times" would fire on plain coincidence rather than a real repeat habit. */
const PRESET_NUDGE_THRESHOLD = 3;

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
        <div key={index} className="flex items-start justify-between gap-3 text-[15px]">
          <span className="min-w-0 flex-1 break-words text-foreground">{line.name}</span>
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
  onSubmit: (rawText: string, nonWorkoutSteps: number | null) => Promise<void>;
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
  onSubmit: (rawText: string, nonWorkoutSteps: number | null) => Promise<void>;
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
  const [stepsText, setStepsText] = useState(
    initialLog?.non_workout_steps != null ? String(initialLog.non_workout_steps) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [enteringExercise, setEnteringExercise] = useState<ExerciseLibraryItem | null>(null);
  /** Set to the just-saved text once it's been logged `PRESET_NUDGE_THRESHOLD`+ times and isn't already a preset — swaps the form for a one-tap "save as preset?" prompt instead of just closing. */
  const [presetNudgeText, setPresetNudgeText] = useState<string | null>(null);
  const [savingPresetNudge, setSavingPresetNudge] = useState(false);

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

    let nonWorkoutSteps: number | null = null;
    if (stepsText.trim()) {
      const parsedSteps = Number(stepsText);
      if (!Number.isFinite(parsedSteps) || parsedSteps < 0) {
        setError("Steps must be a positive number.");
        return;
      }
      nonWorkoutSteps = Math.round(parsedSteps);
    }

    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(rawText, nonWorkoutSteps);

        const trimmed = rawText.trim();
        const alreadyPreset = presets.some((preset) => preset.raw_text.trim() === trimmed);
        const matchCount = alreadyPreset ? 0 : await countMatchingWorkoutLogs(trimmed);
        if (matchCount >= PRESET_NUDGE_THRESHOLD) {
          setPresetNudgeText(trimmed);
        } else {
          onDone();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  async function handleSavePresetNudge() {
    if (!presetNudgeText) return;
    setSavingPresetNudge(true);
    try {
      await onCreatePreset(presetNudgeText);
      onDone();
    } catch {
      // Saving the entry itself already succeeded — a failed preset save
      // just means the nudge silently goes away rather than blocking exit.
      onDone();
    } finally {
      setSavingPresetNudge(false);
    }
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

  if (presetNudgeText) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <DrawerHeader className="pt-2">
          <DrawerTitle className="text-2xl font-bold tracking-tight">Save as a preset?</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-5 py-5">
          <p className="text-sm text-muted-foreground">
            You&rsquo;ve logged this exact workout {PRESET_NUDGE_THRESHOLD}+ times. Save it as a preset so it&rsquo;s
            one tap from &ldquo;Saved&rdquo; next time.
          </p>
        </div>
        <DrawerFooter className="flex-col gap-2 px-5 pb-6">
          <Button onClick={handleSavePresetNudge} disabled={savingPresetNudge}>
            Save as Preset
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={savingPresetNudge} onClick={onDone}>
            No thanks
          </Button>
        </DrawerFooter>
      </div>
    );
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

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0">
            <label htmlFor="non-workout-steps" className="block text-sm font-semibold text-foreground">
              Steps today
            </label>
            <p className="text-xs text-muted-foreground">Outside this workout — walking, errands, general movement.</p>
          </div>
          <Input
            id="non-workout-steps"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            placeholder="10000"
            className="w-28 shrink-0 text-right tabular-nums"
          />
        </div>
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
