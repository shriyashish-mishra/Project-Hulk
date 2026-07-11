"use client";

import { useState, useTransition } from "react";
import { deleteSleepLog, saveSleepDuration } from "@/lib/sleep/actions";
import type { SleepLog } from "@/lib/sleep/types";
import { SleepFormDrawer } from "./sleep-form-drawer";

interface SleepRowProps {
  loggedOn: string;
  initialLog: SleepLog | null;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function SleepRow({ loggedOn, initialLog }: SleepRowProps) {
  const [log, setLog] = useState(initialLog);
  const [, startTransition] = useTransition();

  function handleSave(durationMinutes: number) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const saved = await saveSleepDuration(durationMinutes, loggedOn);
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
          await deleteSleepLog(loggedOn);
          setLog(null);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return (
    <SleepFormDrawer
      initialLog={log}
      onSubmit={handleSave}
      onDelete={log ? handleClear : undefined}
      trigger={
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 py-4 text-left active:opacity-60"
        >
          <span className="text-base font-semibold text-foreground">Sleep</span>
          <span className="text-sm text-muted-foreground">
            {log ? formatDuration(log.duration_minutes) : "Not logged"}
          </span>
        </button>
      }
    />
  );
}
