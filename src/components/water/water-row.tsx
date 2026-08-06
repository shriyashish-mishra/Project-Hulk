"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { setGlassCount } from "@/lib/water/actions";
import { cn } from "@/lib/utils";
import type { WaterLog } from "@/lib/water/types";

interface WaterRowProps {
  loggedOn: string;
  initialLog: WaterLog | null;
  /** There's no drawer to open here (this row is already inline) — deep links like "/more"'s Water shortcut instead scroll to and briefly highlight this row, so the link still visibly lands somewhere instead of just returning to Today. */
  autoFocus?: boolean;
}

/** Explicit +/− buttons — unambiguous, no guessing whether a dot is tappable. */
export function WaterRow({ loggedOn, initialLog, autoFocus }: WaterRowProps) {
  const [count, setCount] = useState(initialLog?.glass_count ?? 0);
  const glassSizeMl = initialLog?.glass_size_ml ?? 250;
  const target = initialLog?.target_glasses ?? 8;
  const [, startTransition] = useTransition();
  const [highlighted, setHighlighted] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlighted(true);
    const timeout = setTimeout(() => setHighlighted(false), 1500);
    return () => clearTimeout(timeout);
  }, [autoFocus]);

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
    <div
      ref={rowRef}
      className={cn(
        "flex flex-col gap-3 rounded-xl py-4 transition-colors duration-500",
        highlighted && "bg-primary/10",
      )}
    >
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
