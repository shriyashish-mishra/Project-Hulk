"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
    <Card>
      <CardContent>
        <WorkoutFormDrawer
          initialLog={log}
          onSubmit={handleSave}
          onDelete={log ? handleClear : undefined}
          trigger={
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 py-0.5 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">Workout</span>
                {log ? (
                  <span className="mt-1 line-clamp-3 block whitespace-pre-line text-sm text-muted-foreground">
                    {preview}
                  </span>
                ) : (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Not logged
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  log
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {log && <Check className="size-3.5" />}
              </span>
            </button>
          }
        />
      </CardContent>
    </Card>
  );
}
