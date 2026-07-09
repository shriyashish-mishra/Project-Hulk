"use client";

import { useState, useTransition, type ReactElement } from "react";
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
import type { WorkoutLog } from "@/lib/workout-logs/types";

const PLACEHOLDER =
  "Chest & Shoulders\n\nAround the World\n4kg\n4 x 12\n\nLateral Raises\n4kg\n4 x 12\n\nIncline Bench Press\n15kg\n4 x 10";

interface WorkoutFormDrawerProps {
  trigger: ReactElement;
  initialLog?: WorkoutLog | null;
  onSubmit: (rawText: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function WorkoutFormDrawer({
  trigger,
  initialLog,
  onSubmit,
  onDelete,
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
          onSubmit={onSubmit}
          onDelete={onDelete}
          onDone={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

interface WorkoutFormBodyProps {
  initialLog?: WorkoutLog | null;
  onSubmit: (rawText: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDone: () => void;
}

function WorkoutFormBody({
  initialLog,
  onSubmit,
  onDelete,
  onDone,
}: WorkoutFormBodyProps) {
  const [rawText, setRawText] = useState(initialLog?.raw_text ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">
          Workout
        </DrawerTitle>
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
