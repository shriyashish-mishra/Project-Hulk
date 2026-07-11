"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { setGlassCount } from "@/lib/water/actions";
import { cn } from "@/lib/utils";
import type { WaterLog } from "@/lib/water/types";

interface WaterRowProps {
  loggedOn: string;
  initialLog: WaterLog | null;
}

/** Explicit +/− buttons — unambiguous, no guessing whether a dot is tappable. */
export function WaterRow({ loggedOn, initialLog }: WaterRowProps) {
  const [count, setCount] = useState(initialLog?.glass_count ?? 0);
  const glassSizeMl = initialLog?.glass_size_ml ?? 250;
  const target = initialLog?.target_glasses ?? 8;
  const [, startTransition] = useTransition();

  const liters = (count * glassSizeMl) / 1000;
  const dotCount = Math.max(target, count);

  function changeBy(delta: number) {
    const previous = count;
    const next = Math.max(0, count + delta);
    if (next === previous) return;
    setCount(next);
    startTransition(async () => {
      try {
        await setGlassCount(next, loggedOn);
      } catch {
        setCount(previous);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">Water</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeBy(-1)}
            disabled={count === 0}
            aria-label="Remove a glass"
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90 disabled:opacity-30"
          >
            <Minus className="size-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => changeBy(1)}
            aria-label="Add a glass"
            className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: dotCount }, (_, index) => (
          <span
            key={index}
            className={cn(
              "size-5 shrink-0 rounded-full border-2",
              index < count
                ? "border-primary bg-primary"
                : "border-muted bg-muted",
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {count} {count === 1 ? "glass" : "glasses"} · {liters.toFixed(1)} L
      </span>
    </div>
  );
}
