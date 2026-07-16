"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Bookmark } from "lucide-react";
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
import type { WorkoutLog } from "@/lib/workout-logs/types";
import type { WorkoutPreset } from "@/lib/workout-presets/types";

const PLACEHOLDER =
  "Chest & Shoulders\n\nAround the World\n4kg\n4 x 12\n\nLateral Raises\n4kg\n4 x 12\n\nIncline Bench Press\n15kg\n4 x 10";

interface WorkoutFormDrawerProps {
  trigger: ReactElement;
  initialLog?: WorkoutLog | null;
  presets: WorkoutPreset[];
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

  function handlePickPreset(presetText: string) {
    setRawText((prev) => (prev.trim() ? `${prev}\n${presetText}` : presetText));
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
        <PresetPickerDrawer
          title="Saved workouts"
          emptyLabel="No saved workouts yet. Add the regimes you repeat often."
          addPlaceholder={PLACEHOLDER}
          presets={presets}
          onSelect={handlePickPreset}
          onCreate={onCreatePreset}
          onUpdate={onUpdatePreset}
          onDelete={onDeletePreset}
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
    </form>
  );
}
