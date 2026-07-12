"use client";

import { useState, useTransition } from "react";
import { clearAllPeriodLogs, logPeriodStart } from "@/lib/cycle/actions";
import { estimateCyclePhase, DEFAULT_CYCLE_LENGTH_DAYS } from "@/lib/cycle/math";
import { CYCLE_PHASE_LABEL, type CycleEstimate } from "@/lib/cycle/types";
import { getLocalDateString } from "@/lib/date";
import { CycleFormDrawer } from "./cycle-form-drawer";

interface CycleRowProps {
  initialEstimate: CycleEstimate | null;
}

/** Female-only row in Daily Signals — parent decides whether to render this at all. */
export function CycleRow({ initialEstimate }: CycleRowProps) {
  const [estimate, setEstimate] = useState(initialEstimate);
  const [, startTransition] = useTransition();

  function handleSave(startedOn: string) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await logPeriodStart(startedOn);
          const cycleLengthDays = estimate?.cycleLengthDays ?? DEFAULT_CYCLE_LENGTH_DAYS;
          setEstimate(estimateCyclePhase(startedOn, cycleLengthDays, getLocalDateString()));
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
          await clearAllPeriodLogs();
          setEstimate(null);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return (
    <CycleFormDrawer
      isTracking={estimate !== null}
      onSubmit={handleSave}
      onClear={handleClear}
      trigger={
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 py-4 text-left active:opacity-60"
        >
          <span className="text-base font-semibold text-foreground">Cycle</span>
          <span className="text-sm text-muted-foreground">
            {estimate ? `Day ${estimate.cycleDay} · ${CYCLE_PHASE_LABEL[estimate.phase]}` : "Not tracked"}
          </span>
        </button>
      }
    />
  );
}
