"use client";

import { useState, useTransition } from "react";
import { deleteWeightLog, saveWeight } from "@/lib/weight/actions";
import type { WeightLog } from "@/lib/weight/types";
import { WeightFormDrawer } from "./weight-form-drawer";

interface WeightRowProps {
  loggedOn: string;
  initialLog: WeightLog | null;
}

export function WeightRow({ loggedOn, initialLog }: WeightRowProps) {
  const [log, setLog] = useState(initialLog);
  const [, startTransition] = useTransition();

  function handleSave(weightKg: number) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          const saved = await saveWeight(weightKg, loggedOn);
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
          await deleteWeightLog(loggedOn);
          setLog(null);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return (
    <WeightFormDrawer
      initialLog={log}
      onSubmit={handleSave}
      onDelete={log ? handleClear : undefined}
      trigger={
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 py-4 text-left active:opacity-60"
        >
          <span className="text-base font-semibold text-foreground">Weight</span>
          <span className="text-sm text-muted-foreground">
            {log ? `${Number(log.weight_kg)} kg` : "Not logged"}
          </span>
        </button>
      }
    />
  );
}
