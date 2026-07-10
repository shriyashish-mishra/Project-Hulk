"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { deleteWorkoutLog, saveWorkoutLog } from "@/lib/workout-logs/actions";
import type { WorkoutLog } from "@/lib/workout-logs/types";
import { WorkoutFormDrawer } from "./workout-form-drawer";

interface WorkoutCardProps {
  loggedOn: string;
  initialLog: WorkoutLog | null;
}

export function WorkoutCard({ loggedOn, initialLog }: WorkoutCardProps) {
  const [log, setLog] = useState(initialLog);
  const [, startTransition] = useTransition();

  const preview = log?.raw_text.split("\n").slice(0, 3).join("\n");

  function handleSave(rawText: string) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const saved = await saveWorkoutLog(rawText, loggedOn);
          setLog(saved);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  function handleClear() {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await deleteWorkoutLog(loggedOn);
          setLog(null);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return (
    <WorkoutFormDrawer
      initialLog={log}
      onSubmit={handleSave}
      onDelete={log ? handleClear : undefined}
      trigger={
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 py-4 text-left active:opacity-60"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-foreground">
              Workout
            </span>
            {log ? (
              <span className="mt-0.5 line-clamp-2 block whitespace-pre-line text-sm text-muted-foreground">
                {preview}
              </span>
            ) : (
              <span className="mt-0.5 block text-sm text-muted-foreground">
                How did training go?
              </span>
            )}
          </span>
          {log ? (
            <Check
              className="size-5 shrink-0 animate-check-pop text-primary"
              strokeWidth={2.5}
            />
          ) : (
            <Plus className="size-5 shrink-0 text-muted-foreground" strokeWidth={2} />
          )}
        </button>
      }
    />
  );
}
