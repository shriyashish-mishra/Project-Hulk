"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseEntryDrawer, type ExerciseFieldValues } from "@/components/workout-templates/exercise-entry-drawer";
import { ExerciseLibraryPickerDrawer } from "@/components/workout-templates/exercise-library-picker-drawer";
import type { ExerciseLibraryItem } from "@/lib/exercise-library/types";
import {
  addSessionExercise,
  completeSession,
  revertSuggestedWeight,
  toggleSessionSet,
  updateSessionExercise,
} from "@/lib/workout-sessions/actions";
import { estimateCalories } from "@/lib/workout-sessions/estimate";
import type { SessionWeightSuggestion } from "@/lib/workout-sessions/exercise-progress";
import type { SessionExercise, SessionExerciseInput, WorkoutSessionWithExercises } from "@/lib/workout-sessions/types";
import { SessionExerciseCard } from "./session-exercise-card";
import { SessionExerciseEditDrawer } from "./session-exercise-edit-drawer";

function toInput(values: ExerciseFieldValues): SessionExerciseInput {
  return {
    sets_planned: values.sets,
    reps: values.reps,
    weight: values.weight,
    weight_unit: values.weightUnit,
    duration_minutes: values.durationMinutes,
    incline_percent: values.inclinePercent,
    speed_kph: values.speedKph,
    notes: values.notes,
  };
}

/** SQLite/Postgres `timestamptz` strings from Supabase are already ISO-parseable, unlike the mobile app's SQLite `datetime('now')` strings — no manual UTC normalization needed here. */
function elapsedMinutesSince(startedAt: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000));
}

function durationMinutesBetween(startedAt: string, completedAt: string): number {
  return Math.max(1, Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000));
}

function formatSessionDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface ActiveSessionProps {
  initialSession: WorkoutSessionWithExercises;
  exercises: ExerciseLibraryItem[];
  /** Keyed by session_exercise id — flags exercises whose pre-filled weight already reflects a Hulk-computed bump/ease from the last time this template was completed. */
  weightSuggestions?: Record<string, SessionWeightSuggestion>;
}

/** Screen 3 — Active Workout Session. Also serves the "quick apply a template" case: nothing requires tapping through sets one by one before completing. */
export function ActiveSession({ initialSession, exercises, weightSuggestions = {} }: ActiveSessionProps) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [elapsedMinutes, setElapsedMinutes] = useState(() => elapsedMinutesSince(initialSession.started_at));
  const [editingExercise, setEditingExercise] = useState<SessionExercise | null>(null);
  const [addingExercise, setAddingExercise] = useState<ExerciseLibraryItem | null>(null);
  const [completing, startCompleting] = useTransition();
  /** Exercises whose "Hulk suggests" badge has been dismissed this session — the badge itself is server-computed from history, so a lightweight local dismiss set is enough to hide it after reverting rather than needing it re-derived. */
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session.completed_at) return;
    const interval = setInterval(() => setElapsedMinutes(elapsedMinutesSince(session.started_at)), 15000);
    return () => clearInterval(interval);
  }, [session.started_at, session.completed_at]);

  function updateLocalExercise(updated: SessionExercise) {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => (exercise.id === updated.id ? updated : exercise)),
    }));
  }

  async function handleToggleSet(exercise: SessionExercise, setIndex: number) {
    const updated = await toggleSessionSet(exercise, setIndex);
    updateLocalExercise(updated);
  }

  async function handleSaveEdit(exercise: SessionExercise, updates: Parameters<typeof updateSessionExercise>[2]) {
    const updated = await updateSessionExercise(exercise.id, exercise.session_id, updates);
    updateLocalExercise(updated);
  }

  async function handleRevertSuggestion(exercise: SessionExercise, previousWeight: number) {
    const updated = await revertSuggestedWeight(
      exercise.id,
      exercise.session_id,
      session.template_id,
      exercise.exercise_id,
      previousWeight,
    );
    updateLocalExercise(updated);
    setDismissedSuggestionIds((prev) => new Set(prev).add(exercise.id));
  }

  async function handleAddExercise(values: ExerciseFieldValues) {
    if (!addingExercise) return;
    const created = await addSessionExercise(session.id, addingExercise.id, toInput(values));
    setSession((prev) => ({ ...prev, exercises: [...prev.exercises, created] }));
  }

  function handleComplete() {
    startCompleting(async () => {
      await completeSession(session.id);
      router.push(`/log/${session.logged_on}`);
    });
  }

  const exercisesCompletedCount = session.exercises.filter((exercise) =>
    exercise.category === "cardio"
      ? exercise.sets_completed > 0
      : exercise.sets_planned != null && exercise.sets_completed >= exercise.sets_planned,
  ).length;
  const isCompleted = session.completed_at !== null;
  const durationMinutes = isCompleted
    ? durationMinutesBetween(session.started_at, session.completed_at as string)
    : elapsedMinutes;
  const estimatedCalories = estimateCalories(session.exercises);
  const sortedExercises = [...session.exercises].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-card py-3">
          <span className="text-[15px] font-bold text-foreground">{durationMinutes} min</span>
          <span className="text-[10px] font-medium text-muted-foreground">{isCompleted ? "DURATION" : "ELAPSED"}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-card py-3">
          <span className="text-[15px] font-bold text-foreground">{session.total_calories ?? estimatedCalories}</span>
          <span className="text-[10px] font-medium text-muted-foreground">KCAL</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-card py-3">
          <span className="text-[15px] font-bold text-foreground">
            {exercisesCompletedCount} / {session.exercises.length}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">EXERCISES</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sortedExercises.map((exercise) => (
          <SessionExerciseCard
            key={exercise.id}
            exercise={exercise}
            onPressField={() => setEditingExercise(exercise)}
            onToggleSet={(setIndex) => handleToggleSet(exercise, setIndex)}
            readOnly={isCompleted}
            weightSuggestion={dismissedSuggestionIds.has(exercise.id) ? undefined : weightSuggestions[exercise.id]}
            onRevertSuggestion={(previousWeight) => handleRevertSuggestion(exercise, previousWeight)}
          />
        ))}
      </div>

      {isCompleted ? (
        <p className="text-center text-sm text-muted-foreground">
          Completed {formatSessionDate(session.completed_at as string)}
        </p>
      ) : (
        <>
          <ExerciseLibraryPickerDrawer
            exercises={exercises}
            onPick={setAddingExercise}
            trigger={
              <button type="button" className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground active:opacity-60">
                <Plus className="size-4" />
                Add exercise you did
              </button>
            }
          />

          <Button onClick={handleComplete} disabled={completing}>
            <Check className="size-4" />
            Complete Workout
          </Button>
        </>
      )}

      <SessionExerciseEditDrawer
        open={editingExercise !== null}
        onOpenChange={(open) => !open && setEditingExercise(null)}
        exercise={editingExercise}
        onSave={(updates) => (editingExercise ? handleSaveEdit(editingExercise, updates) : Promise.resolve())}
      />

      <ExerciseEntryDrawer
        open={addingExercise !== null}
        onOpenChange={(open) => !open && setAddingExercise(null)}
        exercise={addingExercise}
        showRest={false}
        onSave={handleAddExercise}
      />
    </div>
  );
}
