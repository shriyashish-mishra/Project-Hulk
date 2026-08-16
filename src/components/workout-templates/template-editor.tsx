"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addTemplateExercise,
  deleteTemplate,
  moveTemplateExercise,
  removeTemplateExercise,
  renameTemplate,
  updateTemplateExercise,
} from "@/lib/workout-templates/actions";
import type { TemplateExercise, TemplateExerciseInput, WorkoutTemplateWithExercises } from "@/lib/workout-templates/types";
import type { ExerciseLibraryItem } from "@/lib/exercise-library/types";
import { ExerciseActionsDrawer } from "./exercise-actions-drawer";
import { ExerciseEntryDrawer, type ExerciseFieldValues } from "./exercise-entry-drawer";
import { ExerciseLibraryPickerDrawer } from "./exercise-library-picker-drawer";
import { TemplateExerciseRow } from "./template-exercise-row";

function toInput(values: ExerciseFieldValues): TemplateExerciseInput {
  return {
    default_sets: values.sets,
    default_reps: values.reps,
    default_weight: values.weight,
    default_weight_unit: values.weightUnit,
    default_rest_seconds: values.restSeconds,
    default_duration_minutes: values.durationMinutes,
    default_incline_percent: values.inclinePercent,
    default_speed_kph: values.speedKph,
    notes: values.notes,
  };
}

function toFieldValues(exercise: TemplateExercise): ExerciseFieldValues {
  return {
    sets: exercise.default_sets,
    reps: exercise.default_reps,
    weight: exercise.default_weight,
    weightUnit: exercise.default_weight_unit,
    restSeconds: exercise.default_rest_seconds,
    durationMinutes: exercise.default_duration_minutes,
    inclinePercent: exercise.default_incline_percent,
    speedKph: exercise.default_speed_kph,
    notes: exercise.notes,
  };
}

function toLibraryItem(exercise: TemplateExercise): ExerciseLibraryItem {
  return {
    id: exercise.exercise_id,
    user_id: "",
    name: exercise.exercise_name,
    category: exercise.category,
    default_unit: exercise.default_weight_unit ?? "kg",
    met_value: exercise.met_value,
    created_at: "",
  };
}

interface TemplateEditorProps {
  initialTemplate: WorkoutTemplateWithExercises;
  exercises: ExerciseLibraryItem[];
}

export function TemplateEditor({ initialTemplate, exercises }: TemplateEditorProps) {
  const router = useRouter();
  const [template, setTemplate] = useState(initialTemplate);
  const [name, setName] = useState(initialTemplate.name);
  const [entryExercise, setEntryExercise] = useState<ExerciseLibraryItem | null>(null);
  const [editingRow, setEditingRow] = useState<TemplateExercise | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSaveName() {
    if (name.trim() === template.name) return;
    startTransition(async () => {
      await renameTemplate(template.id, name);
      setTemplate((prev) => ({ ...prev, name: name.trim() || prev.name }));
    });
  }

  function openAddFromLibrary(exercise: ExerciseLibraryItem) {
    setEditingRow(null);
    setEntryExercise(exercise);
  }

  function openEdit(exercise: TemplateExercise) {
    setEditingRow(exercise);
    setEntryExercise(toLibraryItem(exercise));
  }

  async function handleSaveEntry(values: ExerciseFieldValues) {
    const input = toInput(values);
    if (editingRow) {
      const updated = await updateTemplateExercise(editingRow.id, input);
      setTemplate((prev) => ({
        ...prev,
        exercises: prev.exercises.map((exercise) => (exercise.id === updated.id ? updated : exercise)),
      }));
    } else if (entryExercise) {
      const created = await addTemplateExercise(template.id, entryExercise.id, input);
      setTemplate((prev) => ({ ...prev, exercises: [...prev.exercises, created] }));
    }
    setEditingRow(null);
  }

  function handleRemove(exerciseId: string) {
    startTransition(async () => {
      await removeTemplateExercise(exerciseId);
      setTemplate((prev) => ({ ...prev, exercises: prev.exercises.filter((exercise) => exercise.id !== exerciseId) }));
    });
  }

  function handleMove(exercise: TemplateExercise, direction: "up" | "down") {
    startTransition(async () => {
      await moveTemplateExercise(template.id, exercise.id, direction);
      setTemplate((prev) => {
        const sorted = [...prev.exercises].sort((a, b) => a.position - b.position);
        const index = sorted.findIndex((row) => row.id === exercise.id);
        const neighborIndex = direction === "up" ? index - 1 : index + 1;
        if (index === -1 || neighborIndex < 0 || neighborIndex >= sorted.length) return prev;
        const swapped = [...sorted];
        const currentPosition = swapped[index].position;
        swapped[index] = { ...swapped[index], position: swapped[neighborIndex].position };
        swapped[neighborIndex] = { ...swapped[neighborIndex], position: currentPosition };
        return { ...prev, exercises: swapped };
      });
    });
  }

  function handleDeleteTemplate() {
    startTransition(async () => {
      await deleteTemplate(template.id);
      router.push("/workouts");
    });
  }

  const sortedExercises = [...template.exercises].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label>Template Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={handleSaveName} placeholder="Pull Day — Upper Body" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Template Exercises
          </p>
          <ExerciseLibraryPickerDrawer
            exercises={exercises}
            onPick={openAddFromLibrary}
            trigger={
              <button type="button" className="flex items-center gap-1 text-sm font-semibold text-primary active:opacity-60">
                <Plus className="size-3.5" />
                Add from library
              </button>
            }
          />
        </div>

        {sortedExercises.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No exercises yet — add one from the library.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedExercises.map((exercise, index) => (
              <TemplateExerciseRow
                key={exercise.id}
                exercise={exercise}
                kebab={
                  <ExerciseActionsDrawer
                    exerciseName={exercise.exercise_name}
                    canMoveUp={index > 0}
                    canMoveDown={index < sortedExercises.length - 1}
                    onEdit={() => openEdit(exercise)}
                    onMoveUp={() => handleMove(exercise, "up")}
                    onMoveDown={() => handleMove(exercise, "down")}
                    onRemove={() => handleRemove(exercise.id)}
                    trigger={
                      <button
                        type="button"
                        aria-label={`${exercise.exercise_name} actions`}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground active:opacity-60"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    }
                  />
                }
              />
            ))}
          </div>
        )}
      </div>

      <ExerciseEntryDrawer
        open={entryExercise !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEntryExercise(null);
            setEditingRow(null);
          }
        }}
        exercise={entryExercise}
        initial={editingRow ? toFieldValues(editingRow) : null}
        onSave={handleSaveEntry}
      />

      <button
        type="button"
        disabled={isPending}
        onClick={handleDeleteTemplate}
        className="flex items-center justify-center gap-1.5 self-start text-sm font-semibold text-destructive active:opacity-60"
      >
        <Trash2 className="size-3.5" />
        Delete template
      </button>
    </div>
  );
}
