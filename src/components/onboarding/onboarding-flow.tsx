"use client";

import { useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { SelectableCard } from "@/components/ui/selectable-card";
import { completeOnboarding } from "@/lib/profile/actions";
import {
  calculateAge,
  calculateCalorieRangeKcal,
  calculateHydrationTargetGlasses,
  calculateProteinTargetG,
} from "@/lib/profile/targets";
import {
  ACTIVITY_LEVEL_LABEL,
  PRIMARY_GOAL_LABEL,
  TRAINING_FREQUENCY_LABEL,
  type ActivityLevel,
  type BiologicalSex,
  type PrimaryGoal,
  type TrainingFrequency,
  type UnitsPreference,
} from "@/lib/profile/types";

interface OnboardingState {
  displayName: string;
  dateOfBirth: string;
  biologicalSex: BiologicalSex | null;
  unitsPreference: UnitsPreference;
  heightCm: string;
  heightFeet: string;
  heightInches: string;
  weightKg: string;
  weightLb: string;
  primaryGoal: PrimaryGoal | null;
  targetWeightKg: string;
  targetWeightLb: string;
  activityLevel: ActivityLevel | null;
  trainingFrequency: TrainingFrequency | null;
}

const INITIAL_STATE: OnboardingState = {
  displayName: "",
  dateOfBirth: "",
  biologicalSex: null,
  unitsPreference: "metric",
  heightCm: "",
  heightFeet: "",
  heightInches: "",
  weightKg: "",
  weightLb: "",
  primaryGoal: null,
  targetWeightKg: "",
  targetWeightLb: "",
  activityLevel: null,
  trainingFrequency: null,
};

const TOTAL_STEPS = 9;
const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.453592;
const MIN_AGE = 13;
const MAX_AGE = 100;

function resolveHeightCm(state: OnboardingState): number | null {
  if (state.unitsPreference === "metric") {
    const cm = Number(state.heightCm);
    return Number.isFinite(cm) && cm > 0 ? cm : null;
  }
  const feet = Number(state.heightFeet);
  const inches = Number(state.heightInches || "0");
  if (!Number.isFinite(feet) || feet <= 0 || !Number.isFinite(inches)) return null;
  return (feet * 12 + inches) * CM_PER_INCH;
}

function resolveWeightKg(state: OnboardingState): number | null {
  if (state.unitsPreference === "metric") {
    const kg = Number(state.weightKg);
    return Number.isFinite(kg) && kg > 0 ? kg : null;
  }
  const lb = Number(state.weightLb);
  return Number.isFinite(lb) && lb > 0 ? lb * KG_PER_LB : null;
}

function resolveTargetWeightKg(state: OnboardingState): number | null {
  if (state.unitsPreference === "metric") {
    const kg = Number(state.targetWeightKg);
    return state.targetWeightKg.trim() && Number.isFinite(kg) && kg > 0 ? kg : null;
  }
  const lb = Number(state.targetWeightLb);
  return state.targetWeightLb.trim() && Number.isFinite(lb) && lb > 0 ? lb * KG_PER_LB : null;
}

function isValidDob(dateOfBirth: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return false;
  const age = calculateAge(dateOfBirth);
  return age >= MIN_AGE && age <= MAX_AGE;
}

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }
  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  const heightCm = resolveHeightCm(state);
  const weightKg = resolveWeightKg(state);

  const canAdvance: boolean[] = [
    true, // name (optional)
    isValidDob(state.dateOfBirth),
    state.biologicalSex !== null,
    heightCm !== null && weightKg !== null,
    state.primaryGoal !== null,
    true, // target weight (optional)
    state.activityLevel !== null,
    state.trainingFrequency !== null,
    true, // review
  ];

  function handleSubmit() {
    if (!state.biologicalSex || !state.primaryGoal || !state.activityLevel || !state.trainingFrequency) {
      return;
    }
    const resolvedHeight = resolveHeightCm(state);
    const resolvedWeight = resolveWeightKg(state);
    if (resolvedHeight === null || resolvedWeight === null) return;

    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding({
          displayName: state.displayName,
          dateOfBirth: state.dateOfBirth,
          biologicalSex: state.biologicalSex!,
          heightCm: resolvedHeight,
          weightKg: resolvedWeight,
          primaryGoal: state.primaryGoal!,
          targetWeightKg: resolveTargetWeightKg(state),
          activityLevel: state.activityLevel!,
          trainingFrequency: state.trainingFrequency!,
          unitsPreference: state.unitsPreference,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex min-h-[85vh] flex-col gap-8">
      <div className="flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground active:scale-90"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <div className="size-9 shrink-0" />
        )}
        <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="flex-1">
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </div>

      <div className="flex-1">
        {step === 0 && (
          <Step title="What should we call you?">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                autoFocus
                value={state.displayName}
                onChange={(e) => update("displayName", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="When were you born?" subtitle="Used only for calculation accuracy.">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dob">Date of birth</Label>
              <input
                id="dob"
                type="date"
                value={state.dateOfBirth}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className="h-12 w-full rounded-2xl bg-muted px-4 text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step title="Biological sex" subtitle="Used for calorie-estimate accuracy, and to choose your muscle map on Progress.">
            <div className="flex flex-col gap-3">
              <SelectableCard label="Female" selected={state.biologicalSex === "female"} onSelect={() => update("biologicalSex", "female")} />
              <SelectableCard label="Male" selected={state.biologicalSex === "male"} onSelect={() => update("biologicalSex", "male")} />
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step title="Height & weight">
            <div className="flex flex-col gap-5">
              <div className="flex gap-2">
                <SegmentButton
                  label="Metric"
                  selected={state.unitsPreference === "metric"}
                  onSelect={() => update("unitsPreference", "metric")}
                />
                <SegmentButton
                  label="Imperial"
                  selected={state.unitsPreference === "imperial"}
                  onSelect={() => update("unitsPreference", "imperial")}
                />
              </div>

              {state.unitsPreference === "metric" ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="heightCm">Height (cm)</Label>
                  <Input
                    id="heightCm"
                    type="number"
                    inputMode="decimal"
                    value={state.heightCm}
                    onChange={(e) => update("heightCm", e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="heightFeet">Height (ft)</Label>
                    <Input
                      id="heightFeet"
                      type="number"
                      inputMode="numeric"
                      value={state.heightFeet}
                      onChange={(e) => update("heightFeet", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="heightInches">(in)</Label>
                    <Input
                      id="heightInches"
                      type="number"
                      inputMode="numeric"
                      value={state.heightInches}
                      onChange={(e) => update("heightInches", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {state.unitsPreference === "metric" ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weightKg">Current weight (kg)</Label>
                  <Input
                    id="weightKg"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={state.weightKg}
                    onChange={(e) => update("weightKg", e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weightLb">Current weight (lb)</Label>
                  <Input
                    id="weightLb"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={state.weightLb}
                    onChange={(e) => update("weightLb", e.target.value)}
                  />
                </div>
              )}
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step title="What's your main goal?">
            <div className="flex flex-col gap-3">
              {(Object.keys(PRIMARY_GOAL_LABEL) as PrimaryGoal[]).map((goal) => (
                <SelectableCard
                  key={goal}
                  label={PRIMARY_GOAL_LABEL[goal]}
                  selected={state.primaryGoal === goal}
                  onSelect={() => update("primaryGoal", goal)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step title="Target weight" subtitle="Optional — skip if you don't want to track a target scale weight.">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="targetWeight">
                Target weight ({state.unitsPreference === "metric" ? "kg" : "lb"})
              </Label>
              <Input
                id="targetWeight"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={state.unitsPreference === "metric" ? state.targetWeightKg : state.targetWeightLb}
                onChange={(e) =>
                  update(state.unitsPreference === "metric" ? "targetWeightKg" : "targetWeightLb", e.target.value)
                }
              />
            </div>
          </Step>
        )}

        {step === 6 && (
          <Step title="How active is your day-to-day, outside of training?">
            <div className="flex flex-col gap-3">
              {(Object.keys(ACTIVITY_LEVEL_LABEL) as ActivityLevel[]).map((level) => (
                <SelectableCard
                  key={level}
                  label={ACTIVITY_LEVEL_LABEL[level]}
                  selected={state.activityLevel === level}
                  onSelect={() => update("activityLevel", level)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 7 && (
          <Step title="How often do you typically train?">
            <div className="flex flex-col gap-3">
              {(Object.keys(TRAINING_FREQUENCY_LABEL) as TrainingFrequency[]).map((freq) => (
                <SelectableCard
                  key={freq}
                  label={TRAINING_FREQUENCY_LABEL[freq]}
                  selected={state.trainingFrequency === freq}
                  onSelect={() => update("trainingFrequency", freq)}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 8 && (
          <ReviewStep state={state} heightCm={heightCm} weightKg={weightKg} error={error} />
        )}
      </div>

      <Button
        type="button"
        disabled={!canAdvance[step] || isPending}
        onClick={step === TOTAL_STEPS - 1 ? handleSubmit : goNext}
      >
        {step === TOTAL_STEPS - 1 ? (isPending ? "Setting up…" : "Start") : step === 5 && !state.targetWeightKg && !state.targetWeightLb ? "Skip" : "Continue"}
      </Button>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SegmentButton({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground"
          : "flex-1 rounded-xl bg-muted py-2 text-sm font-semibold text-muted-foreground"
      }
    >
      {label}
    </button>
  );
}

function ReviewStep({
  state,
  heightCm,
  weightKg,
  error,
}: {
  state: OnboardingState;
  heightCm: number | null;
  weightKg: number | null;
  error: string | null;
}) {
  const proteinTargetG =
    weightKg && state.primaryGoal ? calculateProteinTargetG(weightKg, state.primaryGoal) : null;
  const calorieRange = calculateCalorieRangeKcal({
    dateOfBirth: state.dateOfBirth || null,
    biologicalSex: state.biologicalSex,
    heightCm,
    activityLevel: state.activityLevel,
    primaryGoal: state.primaryGoal,
    latestWeightKg: weightKg,
  });
  const hydrationGlasses = weightKg ? calculateHydrationTargetGlasses(weightKg) : null;

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Your starting point
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Estimates, not rules — every one of these is editable later from
          your Profile.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {proteinTargetG !== null && (
          <ReviewRow label="Daily protein" value={`${proteinTargetG}g`} />
        )}
        {calorieRange !== null && (
          <ReviewRow label="Calorie range" value={`${calorieRange.min}–${calorieRange.max} kcal`} />
        )}
        {hydrationGlasses !== null && (
          <ReviewRow label="Hydration" value={`${hydrationGlasses} glasses`} />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
