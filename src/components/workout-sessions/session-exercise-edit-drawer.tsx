"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeightUnit } from "@/lib/exercise-library/types";
import type { SessionExercise, SessionExerciseUpdate } from "@/lib/workout-sessions/types";

interface SessionExerciseEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: SessionExercise | null;
  onSave: (updates: SessionExerciseUpdate) => Promise<void>;
}

/** Screen 3's lightweight live edit — weight+reps for strength, duration/incline/speed for cardio. No sets/rest here: sets are tracked via the dots and rest isn't edited mid-session. */
export function SessionExerciseEditDrawer({ open, onOpenChange, exercise, onSave }: SessionExerciseEditDrawerProps) {
  const [sessionKey, setSessionKey] = useState(0);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (next) setSessionKey((key) => key + 1);
  }

  if (!exercise) return null;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
      <DrawerContent>
        <EditBody key={sessionKey} exercise={exercise} onSave={onSave} onDone={() => onOpenChange(false)} />
      </DrawerContent>
    </Drawer>
  );
}

function EditBody({
  exercise,
  onSave,
  onDone,
}: {
  exercise: SessionExercise;
  onSave: (updates: SessionExerciseUpdate) => Promise<void>;
  onDone: () => void;
}) {
  const isCardio = exercise.category === "cardio";
  const [weight, setWeight] = useState(exercise.weight != null ? String(exercise.weight) : "");
  const [unit, setUnit] = useState<WeightUnit>(exercise.weight_unit ?? "kg");
  const [reps, setReps] = useState(exercise.reps != null ? String(exercise.reps) : "");
  const [durationMinutes, setDurationMinutes] = useState(exercise.duration_minutes != null ? String(exercise.duration_minutes) : "");
  const [inclinePercent, setInclinePercent] = useState(exercise.incline_percent != null ? String(exercise.incline_percent) : "");
  const [speedKph, setSpeedKph] = useState(exercise.speed_kph != null ? String(exercise.speed_kph) : "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (isCardio) {
          await onSave({
            duration_minutes: durationMinutes.trim() ? Number(durationMinutes) : null,
            incline_percent: inclinePercent.trim() ? Number(inclinePercent) : null,
            speed_kph: speedKph.trim() ? Number(speedKph) : null,
          });
        } else {
          await onSave({
            weight: weight.trim() ? Number(weight) : null,
            weight_unit: weight.trim() ? unit : null,
            reps: reps.trim() ? Number(reps) : null,
          });
        }
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">{exercise.exercise_name}</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-4 px-5 py-5">
        {isCardio ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Minutes</Label>
              <Input type="number" inputMode="decimal" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Incline %</Label>
              <Input type="number" inputMode="decimal" value={inclinePercent} onChange={(e) => setInclinePercent(e.target.value)} placeholder="15" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Speed (kph)</Label>
              <Input type="number" inputMode="decimal" value={speedKph} onChange={(e) => setSpeedKph(e.target.value)} placeholder="3.0" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Weight</Label>
              <Input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="7.5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Unit</Label>
              <div className="flex gap-1.5">
                {(["kg", "lbs"] as const).map((option) => (
                  <Button key={option} type="button" variant={unit === option ? "default" : "secondary"} size="sm" onClick={() => setUnit(option)}>
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Reps</Label>
              <Input type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="20" />
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter className="px-5 pb-6">
        <Button type="submit" disabled={isPending}>
          <Check className="size-4" />
          Save
        </Button>
      </DrawerFooter>
    </form>
  );
}
