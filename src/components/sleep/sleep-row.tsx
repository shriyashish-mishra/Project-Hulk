"use client";

import { useState, useTransition } from "react";
import { deleteSleepLog, saveSleepDuration } from "@/lib/sleep/actions";
import type { SleepLog } from "@/lib/sleep/types";
import { formatDuration } from "@/lib/date";
import { SleepFormDrawer } from "./sleep-form-drawer";

interface SleepRowProps {
  loggedOn: string;
  initialLog: SleepLog | null;
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
            {log
              ? `${formatDuration(log.duration_minutes)} of ${formatDuration(log.target_minutes)} target`
              : "Not logged"}
          </span>
        </button>
      }
    />
  );
}
