"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { deleteWorkoutLog, saveWorkoutLog } from "@/lib/workout-logs/actions";
import type { WorkoutLog } from "@/lib/workout-logs/types";
import { WorkoutFormDrawer } from "./workout-form-drawer";

interface WorkoutCardProps {
  initialLog: WorkoutLog | null;
}

export function WorkoutCard({ initialLog }: WorkoutCardProps) {
  const [log, setLog] = useState(initialLog);
  const [, startTransition] = useTransition();

  const preview = log?.raw_text.split("\n").slice(0, 3).join("\n");

  function handleSave(rawText: string) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const saved = await saveWorkoutLog(rawText);
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
          await deleteWorkoutLog();
          setLog(null);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return (
    <Card
      className="animate-fade-up bg-primary text-primary-foreground ring-0 shadow-[0_16px_36px_-16px_var(--primary)]"
      style={{ animationDelay: "240ms" }}
    >
      <CardContent>
        <WorkoutFormDrawer
          initialLog={log}
          onSubmit={handleSave}
          onDelete={log ? handleClear : undefined}
          trigger={
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 py-1 text-left transition-transform duration-150 active:scale-[0.98]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-primary-foreground">
                  Workout
                </span>
                {log ? (
                  <span className="mt-0.5 line-clamp-2 block whitespace-pre-line text-sm text-primary-foreground/70">
                    {preview}
                  </span>
                ) : (
                  <span className="mt-0.5 block text-sm text-primary-foreground/70">
                    How did training go today?
                  </span>
                )}
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                {log ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  <Plus className="size-4" strokeWidth={2.5} />
                )}
              </span>
            </button>
          }
        />
      </CardContent>
    </Card>
  );
}
