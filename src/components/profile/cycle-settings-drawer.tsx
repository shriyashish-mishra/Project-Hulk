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
import { Label } from "@/components/ui/label";
import { updateProfileFields } from "@/lib/profile/actions";
import { DEFAULT_CYCLE_LENGTH_DAYS } from "@/lib/cycle/math";
import type { Profile } from "@/lib/profile/types";

interface CycleSettingsDrawerProps {
  trigger: ReactElement;
  profile: Profile;
}

export function CycleSettingsDrawer({ trigger, profile }: CycleSettingsDrawerProps) {
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
        <CycleSettingsForm key={sessionKey} profile={profile} onDone={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  );
}

function CycleSettingsForm({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [cycleLength, setCycleLength] = useState(
    String(profile.average_cycle_length_days ?? DEFAULT_CYCLE_LENGTH_DAYS),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number(cycleLength);
    if (!Number.isFinite(parsed) || parsed < 15 || parsed > 60) {
      setError("Enter a cycle length between 15 and 60 days.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateProfileFields({ averageCycleLengthDays: Math.round(parsed) });
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">Cycle Tracking</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-2 px-5 py-6">
        <Label htmlFor="cycle-length">Average cycle length (days)</Label>
        <Input
          id="cycle-length"
          autoFocus
          type="number"
          inputMode="numeric"
          value={cycleLength}
          onChange={(e) => setCycleLength(e.target.value)}
          className="text-2xl font-bold tabular-nums"
        />
        <p className="text-xs text-muted-foreground">
          Used to estimate your current cycle day. Once you&rsquo;ve logged two
          or more periods, this is calculated automatically from your own
          history instead. To log a period start or turn this off entirely,
          use the Cycle row on Today.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter className="px-5 pb-6">
        <Button type="submit" disabled={isPending}>
          Save
        </Button>
      </DrawerFooter>
    </form>
  );
}
