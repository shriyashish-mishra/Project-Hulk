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
import { kgToLb, lbToKg } from "@/lib/profile/units";
import {
  ACTIVITY_LEVEL_LABEL,
  PRIMARY_GOAL_LABEL,
  TRAINING_FREQUENCY_LABEL,
  type ActivityLevel,
  type PrimaryGoal,
  type Profile,
  type TrainingFrequency,
} from "@/lib/profile/types";

interface GoalTrainingDrawerProps {
  trigger: ReactElement;
  profile: Profile;
}

export function GoalTrainingDrawer({ trigger, profile }: GoalTrainingDrawerProps) {
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
        <GoalTrainingForm key={sessionKey} profile={profile} onDone={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  );
}

function GoalTrainingForm({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const isImperial = profile.units_preference === "imperial";
  const initialTargetDisplay = profile.target_weight_kg
    ? isImperial
      ? kgToLb(profile.target_weight_kg)
      : profile.target_weight_kg
    : null;

  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(profile.primary_goal);
  const [targetWeight, setTargetWeight] = useState(
    initialTargetDisplay ? String(Math.round(initialTargetDisplay * 10) / 10) : "",
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(profile.activity_level);
  const [trainingFrequency, setTrainingFrequency] = useState<TrainingFrequency | null>(
    profile.training_frequency,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedTarget = targetWeight.trim() ? Number(targetWeight) : null;
    if (targetWeight.trim() && (!Number.isFinite(parsedTarget) || (parsedTarget ?? 0) <= 0)) {
      setError("Enter a valid target weight, or leave it blank.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateProfileFields({
          primaryGoal: primaryGoal ?? undefined,
          targetWeightKg: parsedTarget ? (isImperial ? lbToKg(parsedTarget) : parsedTarget) : null,
          activityLevel: activityLevel ?? undefined,
          trainingFrequency: trainingFrequency ?? undefined,
        });
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">Goal &amp; Training</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-6 px-5 py-6">
        <div className="flex flex-col gap-2">
          <Label>Primary goal</Label>
          <div className="flex flex-col gap-2">
            {(Object.keys(PRIMARY_GOAL_LABEL) as PrimaryGoal[]).map((goal) => (
              <SelectableCard
                key={goal}
                label={PRIMARY_GOAL_LABEL[goal]}
                selected={primaryGoal === goal}
                onSelect={() => setPrimaryGoal(goal)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-target-weight">
            Target weight ({isImperial ? "lb" : "kg"}) — optional
          </Label>
          <Input
            id="edit-target-weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Activity level</Label>
          <div className="flex flex-col gap-2">
            {(Object.keys(ACTIVITY_LEVEL_LABEL) as ActivityLevel[]).map((level) => (
              <SelectableCard
                key={level}
                label={ACTIVITY_LEVEL_LABEL[level]}
                selected={activityLevel === level}
                onSelect={() => setActivityLevel(level)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Training frequency</Label>
          <div className="flex flex-col gap-2">
            {(Object.keys(TRAINING_FREQUENCY_LABEL) as TrainingFrequency[]).map((freq) => (
              <SelectableCard
                key={freq}
                label={TRAINING_FREQUENCY_LABEL[freq]}
                selected={trainingFrequency === freq}
                onSelect={() => setTrainingFrequency(freq)}
              />
            ))}
          </div>
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
