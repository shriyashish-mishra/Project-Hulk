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
import { Label } from "@/components/ui/label";
import { SelectableCard } from "@/components/ui/selectable-card";
import { updateProfileFields } from "@/lib/profile/actions";
import type { Profile, UnitsPreference } from "@/lib/profile/types";

interface PreferencesDrawerProps {
  trigger: ReactElement;
  profile: Profile;
}

export function PreferencesDrawer({ trigger, profile }: PreferencesDrawerProps) {
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
        <PreferencesForm key={sessionKey} profile={profile} onDone={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  );
}

function PreferencesForm({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [unitsPreference, setUnitsPreference] = useState<UnitsPreference>(profile.units_preference);
  const [timezone, setTimezone] = useState<string>(profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateProfileFields({ unitsPreference, timezone });
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">Preferences</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-6 px-5 py-6">
        <div className="flex flex-col gap-2">
          <Label>Units</Label>
          <div className="flex gap-2">
            <SelectableCard label="Metric" selected={unitsPreference === "metric"} onSelect={() => setUnitsPreference("metric")} />
            <SelectableCard label="Imperial" selected={unitsPreference === "imperial"} onSelect={() => setUnitsPreference("imperial")} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Timezone</Label>
          <p className="text-sm text-muted-foreground">
            {timezone} — used to work out what day and time it is for you (e.g. when &ldquo;today&rdquo; rolls over,
            or when to nudge about tonight&rsquo;s report).
          </p>
          {timezone !== deviceTimezone && (
            <Button type="button" variant="outline" size="sm" onClick={() => setTimezone(deviceTimezone)}>
              Use this device&rsquo;s timezone ({deviceTimezone})
            </Button>
          )}
        </div>

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
