"use client";

import { useMemo, useState, useTransition, type ReactElement } from "react";
import { Dumbbell, Plus, Waves } from "lucide-react";
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
import { findOrCreateExercise } from "@/lib/exercise-library/actions";
import type { ExerciseCategory, ExerciseLibraryItem } from "@/lib/exercise-library/types";

interface ExerciseLibraryPickerDrawerProps {
  trigger: ReactElement;
  exercises: ExerciseLibraryItem[];
  onPick: (exercise: ExerciseLibraryItem) => void;
}

/** "+ Add from library" — search the existing catalog, or create a new entry on the fly when nothing matches. */
export function ExerciseLibraryPickerDrawer({ trigger, exercises, onPick }: ExerciseLibraryPickerDrawerProps) {
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
        <PickerBody
          key={sessionKey}
          exercises={exercises}
          onPick={(exercise) => {
            onPick(exercise);
            setOpen(false);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}

function PickerBody({
  exercises,
  onPick,
}: {
  exercises: ExerciseLibraryItem[];
  onPick: (exercise: ExerciseLibraryItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [newCategory, setNewCategory] = useState<ExerciseCategory>("strength");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return exercises;
    return exercises.filter((item) => item.name.toLowerCase().includes(trimmed));
  }, [exercises, query]);

  const trimmedQuery = query.trim();
  const hasExactMatch = exercises.some((item) => item.name.toLowerCase() === trimmedQuery.toLowerCase());
  const canCreate = trimmedQuery.length > 0 && !hasExactMatch;

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const created = await findOrCreateExercise(trimmedQuery, newCategory, "kg");
        onPick(created);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="pt-2">
        <DrawerTitle className="text-2xl font-bold tracking-tight">Add from Library</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col gap-3 overflow-y-auto px-5 py-5">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" />

        <div className="flex flex-col gap-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item)}
              className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-left active:opacity-60"
            >
              <span className="flex items-center gap-2.5">
                {item.category === "cardio" ? (
                  <Waves className="size-4 text-primary" />
                ) : (
                  <Dumbbell className="size-4 text-primary" />
                )}
                <span className="text-[15px] font-semibold text-foreground">{item.name}</span>
              </span>
              <Plus className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {canCreate && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Not in your library yet</p>
            <div className="flex gap-1.5">
              {(["strength", "cardio"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={newCategory === option ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setNewCategory(option)}
                >
                  {option === "strength" ? "Strength" : "Cardio"}
                </Button>
              ))}
            </div>
            <Button type="button" disabled={isPending} onClick={handleCreate}>
              <Plus className="size-4" />
              {`Create "${trimmedQuery}"`}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {!canCreate && filtered.length === 0 && (
        <DrawerFooter className="px-5 pb-6">
          <p className="text-sm text-muted-foreground">Type a name to search or add a new exercise.</p>
        </DrawerFooter>
      )}
    </div>
  );
}
