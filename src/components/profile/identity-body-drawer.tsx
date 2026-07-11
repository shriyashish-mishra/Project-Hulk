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
import { SelectableCard } from "@/components/ui/selectable-card";
import { updateProfileFields } from "@/lib/profile/actions";
import { cmToFeetInches, feetInchesToCm } from "@/lib/profile/units";
import type { BiologicalSex, Profile } from "@/lib/profile/types";

interface IdentityBodyDrawerProps {
  trigger: ReactElement;
  profile: Profile;
}

export function IdentityBodyDrawer({ trigger, profile }: IdentityBodyDrawerProps) {
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
        <IdentityBodyForm key={sessionKey} profile={profile} onDone={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  );
}

function IdentityBodyForm({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const isImperial = profile.units_preference === "imperial";
  const initialHeight = profile.height_cm ?? 0;
  const initialImperial = cmToFeetInches(initialHeight);

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth ?? "");
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | null>(profile.biological_sex);
  const [heightCm, setHeightCm] = useState(profile.height_cm ? String(profile.height_cm) : "");
  const [heightFeet, setHeightFeet] = useState(
    profile.height_cm ? String(initialImperial.feet) : "",
  );
  const [heightInches, setHeightInches] = useState(
    profile.height_cm ? String(initialImperial.inches) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const resolvedHeight = isImperial
      ? feetInchesToCm(Number(heightFeet) || 0, Number(heightInches) || 0)
      : Number(heightCm);

    if (!Number.isFinite(resolvedHeight) || resolvedHeight <= 0) {
      setError("Enter a valid height.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateProfileFields({
          displayName,
          dateOfBirth: dateOfBirth || undefined,
          biologicalSex: biologicalSex ?? undefined,
          heightCm: resolvedHeight,
        });
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">You</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-5 px-5 py-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-name">Name</Label>
          <Input id="edit-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-dob">Date of birth</Label>
          <input
            id="edit-dob"
            type="date"
            value={dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="h-12 w-full rounded-2xl bg-muted px-4 text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Biological sex</Label>
          <div className="flex gap-2">
            <SelectableCard label="Female" selected={biologicalSex === "female"} onSelect={() => setBiologicalSex("female")} />
            <SelectableCard label="Male" selected={biologicalSex === "male"} onSelect={() => setBiologicalSex("male")} />
          </div>
        </div>

        {isImperial ? (
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="edit-height-ft">Height (ft)</Label>
              <Input id="edit-height-ft" type="number" inputMode="numeric" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="edit-height-in">(in)</Label>
              <Input id="edit-height-in" type="number" inputMode="numeric" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-height-cm">Height (cm)</Label>
            <Input id="edit-height-cm" type="number" inputMode="decimal" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </div>
        )}

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
