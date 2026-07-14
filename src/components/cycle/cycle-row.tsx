"use client";

import { useState, useTransition } from "react";
import { clearAllPeriodLogs, logPeriodStart, markPeriodEnded } from "@/lib/cycle/actions";
import { calculateAverageCycleLengthDays, DEFAULT_CYCLE_LENGTH_DAYS, estimateCyclePhase } from "@/lib/cycle/math";
import { CYCLE_PHASE_LABEL, type PeriodRange } from "@/lib/cycle/types";
import { addDays, getLocalDateString } from "@/lib/date";
import { CycleFormDrawer } from "./cycle-form-drawer";

interface CycleRowProps {
  initialPeriods: PeriodRange[];
  fallbackCycleLengthDays: number | null;
  /** Which date this row is "as of" — today on the Today page, the backfilled day on a past-day log page. */
  asOfDate?: string;
}

/** Female-only row in Daily Signals — parent decides whether to render this at all. */
export function CycleRow({ initialPeriods, fallbackCycleLengthDays, asOfDate = getLocalDateString() }: CycleRowProps) {
  const [periods, setPeriods] = useState(initialPeriods);
  const [, startTransition] = useTransition();

  const cycleLengthDays =
    calculateAverageCycleLengthDays(periods) ?? fallbackCycleLengthDays ?? DEFAULT_CYCLE_LENGTH_DAYS;
  const estimate = periods.length > 0 ? estimateCyclePhase(periods, cycleLengthDays, asOfDate) : null;

  function handleSaveStart(startedOn: string) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await logPeriodStart(startedOn);
          setPeriods((prev) => {
            const closed = prev.map((p) =>
              p.endedOn === null && p.startedOn < startedOn
                ? { ...p, endedOn: addDays(startedOn, -1) }
                : p,
            );
            const withoutSameStart = closed.filter((p) => p.startedOn !== startedOn);
            return [...withoutSameStart, { startedOn, endedOn: null }].sort((a, b) =>
              a.startedOn.localeCompare(b.startedOn),
            );
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  function handleMarkEnded(endedOn: string) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await markPeriodEnded(endedOn);
          setPeriods((prev) => {
            const lastOpenIndex = [...prev].reverse().findIndex((p) => p.endedOn === null);
            if (lastOpenIndex === -1) return prev;
            const idx = prev.length - 1 - lastOpenIndex;
            const next = [...prev];
            next[idx] = { ...next[idx], endedOn };
            return next;
          });
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
          setPeriods([]);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return (
    <CycleFormDrawer
      isTracking={periods.length > 0}
      isOngoing={estimate?.isOngoing ?? false}
      asOfDate={asOfDate}
      onSubmitStart={handleSaveStart}
      onSubmitEnd={handleMarkEnded}
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
