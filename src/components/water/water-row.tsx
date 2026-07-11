"use client";

import { useState, useTransition } from "react";
import { setGlassCount } from "@/lib/water/actions";
import { cn } from "@/lib/utils";
import type { WaterLog } from "@/lib/water/types";

interface WaterRowProps {
  loggedOn: string;
  initialLog: WaterLog | null;
}

/**
 * Tap an empty dot to add a glass, tap any filled dot to remove one — no
 * modal, no form, the fastest possible log per the "almost effortless"
 * requirement. Dots are visually interchangeable, so which one is tapped
 * doesn't matter, only its filled state.
 */
export function WaterRow({ loggedOn, initialLog }: WaterRowProps) {
  const [count, setCount] = useState(initialLog?.glass_count ?? 0);
  const glassSizeMl = initialLog?.glass_size_ml ?? 250;
  const target = initialLog?.target_glasses ?? 8;
  const [, startTransition] = useTransition();

  const liters = (count * glassSizeMl) / 1000;
  const dotCount = Math.max(target, count);

  function handleTap(filled: boolean) {
    const previous = count;
    const next = filled ? count - 1 : count + 1;
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
      <span className="text-base font-semibold text-foreground">Water</span>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: dotCount }, (_, index) => {
          const filled = index < count;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleTap(filled)}
              aria-label={filled ? "Remove a glass" : "Add a glass"}
              className={cn(
                "size-6 shrink-0 rounded-full border transition-transform active:scale-90",
                filled ? "border-primary bg-primary/25" : "border-border bg-transparent",
              )}
            />
          );
        })}
      </div>
      <span className="text-sm text-muted-foreground">
        {count} {count === 1 ? "glass" : "glasses"} · {liters.toFixed(1)} L
      </span>
    </div>
  );
}
