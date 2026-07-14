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
import { getLocalDateString } from "@/lib/date";

interface CycleFormDrawerProps {
  trigger: ReactElement;
  isTracking: boolean;
  isOngoing: boolean;
  /** Defaults both date inputs to this day instead of real "today" — lets a past-day log page backfill periods for that day. */
  asOfDate: string;
  onSubmitStart: (startedOn: string) => Promise<void>;
  onSubmitEnd: (endedOn: string) => Promise<void>;
  onClear: () => Promise<void>;
}

export function CycleFormDrawer({
  trigger,
  isTracking,
  isOngoing,
  asOfDate,
  onSubmitStart,
  onSubmitEnd,
  onClear,
}: CycleFormDrawerProps) {
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
        <CycleFormBody
          key={sessionKey}
          isTracking={isTracking}
          isOngoing={isOngoing}
          asOfDate={asOfDate}
          onSubmitStart={onSubmitStart}
          onSubmitEnd={onSubmitEnd}
          onClear={onClear}
          onDone={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

function CycleFormBody({
  isTracking,
  isOngoing,
  asOfDate,
  onSubmitStart,
  onSubmitEnd,
  onClear,
  onDone,
}: {
  isTracking: boolean;
  isOngoing: boolean;
  asOfDate: string;
  onSubmitStart: (startedOn: string) => Promise<void>;
  onSubmitEnd: (endedOn: string) => Promise<void>;
  onClear: () => Promise<void>;
  onDone: () => void;
}) {
  const today = getLocalDateString();
  const [startedOn, setStartedOn] = useState(asOfDate);
  const [endedOn, setEndedOn] = useState(asOfDate);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmitStart(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSubmitStart(startedOn);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleSubmitEnd() {
    setError(null);
    startTransition(async () => {
      try {
        await onSubmitEnd(endedOn);
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleClear() {
    setError(null);
    startTransition(async () => {
      try {
        await onClear();
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to clear.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmitStart} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">Log period start</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-2 px-5 py-6">
        <input
          type="date"
          value={startedOn}
          max={today}
          onChange={(e) => setStartedOn(e.target.value)}
          className="h-12 w-full rounded-2xl bg-muted px-4 text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <p className="text-xs text-muted-foreground">
          Private, and only used to gently inform tomorrow&rsquo;s workout
          suggestions. Update anytime, or leave it be — this is entirely
          optional.
        </p>

        {isOngoing && (
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">Mark period as over</p>
            <input
              type="date"
              value={endedOn}
              min={startedOn}
              max={today}
              onChange={(e) => setEndedOn(e.target.value)}
              className="h-12 w-full rounded-2xl bg-muted px-4 text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={handleSubmitEnd}
            >
              Mark as over
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter className="flex flex-col gap-2 px-5 pb-6">
        <Button type="submit" disabled={isPending}>
          Save
        </Button>
        {isTracking && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isPending}
            onClick={handleClear}
          >
            Stop tracking
          </Button>
        )}
      </DrawerFooter>
    </form>
  );
}
