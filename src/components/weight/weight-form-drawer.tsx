"use client";

import { useState, useTransition, type ReactElement } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WeightLog } from "@/lib/weight/types";

interface WeightFormDrawerProps {
  trigger: ReactElement;
  initialLog?: WeightLog | null;
  onSubmit: (weightKg: number) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function WeightFormDrawer({
  trigger,
  initialLog,
  onSubmit,
  onDelete,
}: WeightFormDrawerProps) {
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
        <WeightFormBody
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

interface WeightFormBodyProps {
  initialLog?: WeightLog | null;
  onSubmit: (weightKg: number) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDone: () => void;
}

function WeightFormBody({ initialLog, onSubmit, onDelete, onDone }: WeightFormBodyProps) {
  const [value, setValue] = useState(
    initialLog ? String(Number(initialLog.weight_kg)) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseFloat(value);
    if (!value.trim() || Number.isNaN(parsed)) {
      setError("Enter your weight.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await onSubmit(parsed);
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
        <DrawerTitle className="text-2xl font-bold tracking-tight">Weight</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-2 px-5 py-6">
        <div className="flex items-center gap-3">
          <Input
            autoFocus
            type="number"
            inputMode="decimal"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="64.8"
            className="text-2xl font-bold tabular-nums"
          />
          <span className="shrink-0 text-sm text-muted-foreground">kg</span>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
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
