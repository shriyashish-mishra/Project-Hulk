"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { deleteWorkoutLog, saveWorkoutLog } from "@/lib/workout-logs/actions";
import {
  createWorkoutPreset,
  deleteWorkoutPreset,
  updateWorkoutPreset,
} from "@/lib/workout-presets/actions";
import type { WorkoutLog } from "@/lib/workout-logs/types";
import type { WorkoutPreset } from "@/lib/workout-presets/types";
import { WorkoutFormDrawer } from "./workout-form-drawer";

interface WorkoutCardProps {
  loggedOn: string;
  initialLog: WorkoutLog | null;
  initialPresets: WorkoutPreset[];
}

export function WorkoutCard({ loggedOn, initialLog, initialPresets }: WorkoutCardProps) {
  const [log, setLog] = useState(initialLog);
  const [presets, setPresets] = useState(initialPresets);
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

  async function handleCreatePreset(rawText: string) {
    const created = await createWorkoutPreset(rawText);
    setPresets((prev) => [...prev, created]);
    return created;
  }

  async function handleUpdatePreset(id: string, rawText: string) {
    const updated = await updateWorkoutPreset(id, rawText);
    setPresets((prev) => prev.map((preset) => (preset.id === id ? updated : preset)));
    return updated;
  }

  async function handleDeletePreset(id: string) {
    await deleteWorkoutPreset(id);
    setPresets((prev) => prev.filter((preset) => preset.id !== id));
  }

  return (
    <WorkoutFormDrawer
      initialLog={log}
      presets={presets}
      onSubmit={handleSave}
      onDelete={log ? handleClear : undefined}
      onCreatePreset={handleCreatePreset}
      onUpdatePreset={handleUpdatePreset}
      onDeletePreset={handleDeletePreset}
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
