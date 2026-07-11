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
import { calculateProteinTargetG } from "@/lib/profile/targets";
import type { Profile } from "@/lib/profile/types";

interface TargetsDrawerProps {
  trigger: ReactElement;
  profile: Profile;
  latestWeightKg: number | null;
}

export function TargetsDrawer({ trigger, profile, latestWeightKg }: TargetsDrawerProps) {
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
        <TargetsForm
          key={sessionKey}
          profile={profile}
          latestWeightKg={latestWeightKg}
          onDone={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

function TargetsForm({
  profile,
  latestWeightKg,
  onDone,
}: {
  profile: Profile;
  latestWeightKg: number | null;
  onDone: () => void;
}) {
  const suggested =
    latestWeightKg && profile.primary_goal
      ? calculateProteinTargetG(latestWeightKg, profile.primary_goal)
      : null;

  const [proteinTargetG, setProteinTargetG] = useState(
    String(profile.protein_target_g ?? suggested ?? ""),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number(proteinTargetG);
    if (!proteinTargetG.trim() || !Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid protein target.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateProfileFields({ proteinTargetG: Math.round(parsed) });
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">Targets</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-2 px-5 py-6">
        <Label htmlFor="edit-protein">Daily protein target (g)</Label>
        <Input
          id="edit-protein"
          autoFocus
          type="number"
          inputMode="numeric"
          value={proteinTargetG}
          onChange={(e) => setProteinTargetG(e.target.value)}
          className="text-2xl font-bold tabular-nums"
        />
        <p className="text-xs text-muted-foreground">
          Calorie range and hydration are estimated automatically from your
          details and aren&rsquo;t set directly.
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
