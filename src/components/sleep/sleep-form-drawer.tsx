"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { SleepLog } from "@/lib/sleep/types";

interface SleepFormDrawerProps {
  trigger: ReactElement;
  initialLog?: SleepLog | null;
  onSubmit: (durationMinutes: number) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function SleepFormDrawer({
  trigger,
  initialLog,
  onSubmit,
  onDelete,
}: SleepFormDrawerProps) {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setSessionKey((key) => key + 1);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <SleepFormBody
          key={sessionKey}
          initialLog={initialLog}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onDone={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

function Stepper({
  label,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <span className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90"
        >
          <Minus className="size-4" strokeWidth={2.5} />
        </button>
        <span className="w-10 text-center text-3xl font-bold tabular-nums text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          aria-label={`Increase ${label.toLowerCase()}`}
          className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

interface SleepFormBodyProps {
  initialLog?: SleepLog | null;
  onSubmit: (durationMinutes: number) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDone: () => void;
}

function SleepFormBody({ initialLog, onSubmit, onDelete, onDone }: SleepFormBodyProps) {
  const initialTotal = initialLog?.duration_minutes ?? 7 * 60 + 30;
  const [hours, setHours] = useState(Math.floor(initialTotal / 60));
  const [minutes, setMinutes] = useState(initialTotal % 60);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(hours * 60 + minutes);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleClear() {
    if (!onDelete) return;
    setError(null);
    startTransition(async () => {
      try {
        await onDelete();
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to clear.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">Sleep</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-4 px-5 py-6">
        <div className="flex items-center justify-center gap-6">
          <Stepper label="Hours" value={hours} step={1} min={0} max={16} onChange={setHours} />
          <Stepper
            label="Minutes"
            value={minutes}
            step={15}
            min={0}
            max={45}
            onChange={setMinutes}
          />
        </div>
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter className="px-5 pb-6">
        <Button type="submit" disabled={isPending}>
          Save
        </Button>
        {initialLog && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isPending}
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </DrawerFooter>
    </form>
  );
}
