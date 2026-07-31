"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ExerciseLibraryItem, WeightUnit } from "@/lib/exercise-library/types";

export interface ExerciseFieldValues {
  sets: number | null;
  reps: number | null;
  weight: number | null;
  weightUnit: WeightUnit | null;
  restSeconds: number | null;
  durationMinutes: number | null;
  inclinePercent: number | null;
  speedKph: number | null;
  notes: string | null;
}

interface ExerciseEntryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: ExerciseLibraryItem | null;
  initial?: ExerciseFieldValues | null;
  /** Templates track rest between sets; a live session doesn't edit it. */
  showRest?: boolean;
  onSave: (values: ExerciseFieldValues) => Promise<void>;
}

function toText(value: number | null): string {
  return value != null ? String(value) : "";
}

function toNumber(text: string): number | null {
  const trimmed = text.trim();
  return trimmed ? Number(trimmed) : null;
}

/**
 * Screen 1's structured entry — sets/reps/weight/rest/notes for a strength
 * exercise, or duration/incline/speed/notes for cardio. Shared between the
 * Template Editor's "+ Add from library" / kebab "Edit defaults" and the
 * Active Session's "+ Add exercise" — the only difference is `showRest`.
 * Controlled (no trigger of its own) since every caller opens it
 * programmatically — after picking from the library, or from a kebab menu.
 */
export function ExerciseEntryDrawer({ open, onOpenChange, exercise, initial, showRest = true, onSave }: ExerciseEntryDrawerProps) {
  const [sessionKey, setSessionKey] = useState(0);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (next) setSessionKey((key) => key + 1);
  }

  if (!exercise) return null;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
      <DrawerContent>
        <ExerciseEntryBody
          key={sessionKey}
          exercise={exercise}
          initial={initial}
          showRest={showRest}
          onSave={onSave}
          onDone={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

interface ExerciseEntryBodyProps {
  exercise: ExerciseLibraryItem;
  initial?: ExerciseFieldValues | null;
  showRest: boolean;
  onSave: (values: ExerciseFieldValues) => Promise<void>;
  onDone: () => void;
}

function ExerciseEntryBody({ exercise, initial, showRest, onSave, onDone }: ExerciseEntryBodyProps) {
  const isCardio = exercise.category === "cardio";
  const [sets, setSets] = useState(toText(initial?.sets ?? null));
  const [reps, setReps] = useState(toText(initial?.reps ?? null));
  const [weight, setWeight] = useState(toText(initial?.weight ?? null));
  const [unit, setUnit] = useState<WeightUnit>(initial?.weightUnit ?? exercise.default_unit);
  const [rest, setRest] = useState(toText(initial?.restSeconds ?? null));
  const [durationMinutes, setDurationMinutes] = useState(toText(initial?.durationMinutes ?? null));
  const [inclinePercent, setInclinePercent] = useState(toText(initial?.inclinePercent ?? null));
  const [speedKph, setSpeedKph] = useState(toText(initial?.speedKph ?? null));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onSave({
          sets: isCardio ? null : toNumber(sets),
          reps: isCardio ? null : toNumber(reps),
          weight: isCardio ? null : toNumber(weight),
          weightUnit: isCardio ? null : toNumber(weight) != null ? unit : null,
          restSeconds: isCardio ? null : toNumber(rest),
          durationMinutes: isCardio ? toNumber(durationMinutes) : null,
          inclinePercent: isCardio ? toNumber(inclinePercent) : null,
          speedKph: isCardio ? toNumber(speedKph) : null,
          notes: notes.trim() || null,
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
        <DrawerTitle className="text-2xl font-bold tracking-tight">{exercise.name}</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
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
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Sets</Label>
                <Input type="number" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="4" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Reps</Label>
                <Input type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="20" />
              </div>
            </div>
            <div className={`grid gap-3 ${showRest ? "grid-cols-3" : "grid-cols-2"}`}>
              <div className="flex flex-col gap-1.5">
                <Label>Weight</Label>
                <Input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="7.5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Unit</Label>
                <div className="flex gap-1.5">
                  {(["kg", "lbs"] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={unit === option ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setUnit(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              {showRest && (
                <div className="flex flex-col gap-1.5">
                  <Label>Rest (sec)</Label>
                  <Input type="number" inputMode="numeric" value={rest} onChange={(e) => setRest(e.target.value)} placeholder="60" />
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <Label>Notes</Label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isCardio ? "Flat pace, steady state" : "Alternating dumbbells, controlled eccentric"}
            className="min-h-20 resize-none"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter className="px-5 pb-6">
        <Button type="submit" disabled={isPending}>
          <Check className="size-4" />
          Save Exercise
        </Button>
      </DrawerFooter>
    </form>
  );
}
