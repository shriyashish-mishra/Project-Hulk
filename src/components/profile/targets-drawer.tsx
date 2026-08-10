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
import { calculateAllTargetSuggestions, type TargetSuggestion } from "@/lib/profile/targets";
import type { Profile } from "@/lib/profile/types";

interface TargetsDrawerProps {
  trigger: ReactElement;
  profile: Profile;
  latestWeightKg: number | null;
  age: number | null;
}

export function TargetsDrawer({ trigger, profile, latestWeightKg, age }: TargetsDrawerProps) {
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
          age={age}
          onDone={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

/** `text` is what's shown in the input; `auto` tracks whether this field should be saved as `null` (keep auto-computing) regardless of what `text` currently displays — set true whenever there's no stored override yet, and flipped false the moment the user types. */
interface FieldState {
  text: string;
  auto: boolean;
}

function initField(overrideValue: number | null, suggestionValue: number | undefined): FieldState {
  return {
    text: overrideValue != null ? String(overrideValue) : suggestionValue != null ? String(suggestionValue) : "",
    auto: overrideValue == null,
  };
}

/** Parses a non-auto field's text into a positive integer to save, or `undefined` if it's blank/invalid. Auto fields always resolve to `null` (revert to automatic) regardless of their displayed text. */
function resolveFieldValue(field: FieldState): number | null | undefined {
  if (field.auto) return null;
  const parsed = Number(field.text);
  if (!field.text.trim() || !Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.round(parsed);
}

/** Same contract as `resolveFieldValue`, but the field is edited in hours and stored in minutes. */
function resolveSleepMinutes(field: FieldState): number | null | undefined {
  if (field.auto) return null;
  const parsedHours = Number(field.text);
  if (!field.text.trim() || !Number.isFinite(parsedHours) || parsedHours <= 0) return undefined;
  return Math.round(parsedHours * 60);
}

function TargetField({
  id,
  label,
  unit,
  field,
  suggestion,
  onChange,
  onReset,
}: {
  id: string;
  label: string;
  unit: string;
  field: FieldState;
  suggestion: TargetSuggestion | null;
  onChange: (text: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label} ({unit})
        </Label>
        {!field.auto && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-primary active:opacity-60"
          >
            Reset to auto
          </button>
        )}
      </div>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={field.text}
        onChange={(e) => onChange(e.target.value)}
        className="text-xl font-bold tabular-nums"
      />
      <p className="text-xs text-muted-foreground">
        {suggestion
          ? `Suggested: ${suggestion.insight}`
          : "Add your height, weight, and goal in Profile for a suggested default."}
      </p>
    </div>
  );
}

function TargetsForm({
  profile,
  latestWeightKg,
  age,
  onDone,
}: {
  profile: Profile;
  latestWeightKg: number | null;
  age: number | null;
  onDone: () => void;
}) {
  const suggestions = calculateAllTargetSuggestions({
    targetWeightKg: profile.target_weight_kg,
    currentWeightKg: latestWeightKg,
    dateOfBirth: profile.date_of_birth,
    biologicalSex: profile.biological_sex,
    heightCm: profile.height_cm,
    activityLevel: profile.activity_level,
    primaryGoal: profile.primary_goal,
    age,
  });

  const [protein, setProtein] = useState<FieldState>(() => initField(profile.protein_target_g, suggestions.protein?.value));
  const [calories, setCalories] = useState<FieldState>(() =>
    initField(profile.calorie_target_kcal, suggestions.calories?.value),
  );
  const [carbs, setCarbs] = useState<FieldState>(() => initField(profile.carbs_target_g, suggestions.carbs?.value));
  const [fat, setFat] = useState<FieldState>(() => initField(profile.fat_target_g, suggestions.fat?.value));
  const [fiber, setFiber] = useState<FieldState>(() => initField(profile.fiber_target_g, suggestions.fiber?.value));
  const [hydration, setHydration] = useState<FieldState>(() =>
    initField(profile.hydration_target_glasses, suggestions.hydration?.value),
  );
  const initialSleepHours =
    profile.sleep_target_minutes != null
      ? profile.sleep_target_minutes / 60
      : suggestions.sleep.value / 60;
  const [sleepHours, setSleepHours] = useState<FieldState>({
    text: String(Math.round(initialSleepHours * 10) / 10),
    auto: profile.sleep_target_minutes == null,
  });

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetField(setField: (field: FieldState) => void, suggestionValue: number | undefined) {
    setField({ text: suggestionValue != null ? String(suggestionValue) : "", auto: true });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const proteinTargetG = resolveFieldValue(protein);
    const calorieTargetKcal = resolveFieldValue(calories);
    const carbsTargetG = resolveFieldValue(carbs);
    const fatTargetG = resolveFieldValue(fat);
    const fiberTargetG = resolveFieldValue(fiber);
    const hydrationTargetGlasses = resolveFieldValue(hydration);
    const sleepTargetMinutes = resolveSleepMinutes(sleepHours);

    if (
      [proteinTargetG, calorieTargetKcal, carbsTargetG, fatTargetG, fiberTargetG, hydrationTargetGlasses, sleepTargetMinutes].some(
        (value) => value === undefined,
      )
    ) {
      setError("Enter a valid number for every target you've changed, or reset it to auto.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateProfileFields({
          proteinTargetG,
          calorieTargetKcal,
          carbsTargetG,
          fatTargetG,
          fiberTargetG,
          hydrationTargetGlasses,
          sleepTargetMinutes,
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
        <DrawerTitle className="text-2xl font-bold tracking-tight">Targets</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
        <TargetField
          id="edit-protein"
          label="Protein"
          unit="g"
          field={protein}
          suggestion={suggestions.protein}
          onChange={(text) => setProtein({ text, auto: false })}
          onReset={() => resetField(setProtein, suggestions.protein?.value)}
        />
        <TargetField
          id="edit-calories"
          label="Calories"
          unit="kcal"
          field={calories}
          suggestion={suggestions.calories}
          onChange={(text) => setCalories({ text, auto: false })}
          onReset={() => resetField(setCalories, suggestions.calories?.value)}
        />
        <TargetField
          id="edit-carbs"
          label="Carbs"
          unit="g"
          field={carbs}
          suggestion={suggestions.carbs}
          onChange={(text) => setCarbs({ text, auto: false })}
          onReset={() => resetField(setCarbs, suggestions.carbs?.value)}
        />
        <TargetField
          id="edit-fat"
          label="Fat"
          unit="g"
          field={fat}
          suggestion={suggestions.fat}
          onChange={(text) => setFat({ text, auto: false })}
          onReset={() => resetField(setFat, suggestions.fat?.value)}
        />
        <TargetField
          id="edit-fiber"
          label="Fiber"
          unit="g"
          field={fiber}
          suggestion={suggestions.fiber}
          onChange={(text) => setFiber({ text, auto: false })}
          onReset={() => resetField(setFiber, suggestions.fiber?.value)}
        />
        <TargetField
          id="edit-hydration"
          label="Hydration"
          unit="glasses"
          field={hydration}
          suggestion={suggestions.hydration}
          onChange={(text) => setHydration({ text, auto: false })}
          onReset={() => resetField(setHydration, suggestions.hydration?.value)}
        />
        <TargetField
          id="edit-sleep"
          label="Sleep"
          unit="hours"
          field={sleepHours}
          suggestion={suggestions.sleep}
          onChange={(text) => setSleepHours({ text, auto: false })}
          onReset={() => resetField(setSleepHours, Math.round((suggestions.sleep.value / 60) * 10) / 10)}
        />
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
