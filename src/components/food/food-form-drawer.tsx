"use client";

import { useState, useTransition, type ReactElement } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FoodLogFormInput } from "@/lib/food-logs/actions";
import type { FoodLog, MealType } from "@/lib/food-logs/types";

interface FoodFormDrawerProps {
  trigger: ReactElement;
  mealType: MealType;
  mealLabel: string;
  initialLog?: FoodLog;
  onSubmit: (input: FoodLogFormInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function FoodFormDrawer({
  trigger,
  mealType,
  mealLabel,
  initialLog,
  onSubmit,
  onDelete,
}: FoodFormDrawerProps) {
  const [open, setOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // Force the form body to remount with fresh state each time the
      // drawer opens, discarding any edits from a prior cancelled session.
      setSessionKey((key) => key + 1);
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <FoodFormBody
          key={sessionKey}
          mealType={mealType}
          mealLabel={mealLabel}
          initialLog={initialLog}
          onSubmit={onSubmit}
          onDelete={onDelete}
          onDone={() => setOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

interface FoodFormBodyProps {
  mealType: MealType;
  mealLabel: string;
  initialLog?: FoodLog;
  onSubmit: (input: FoodLogFormInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDone: () => void;
}

function FoodFormBody({
  mealType,
  mealLabel,
  initialLog,
  onSubmit,
  onDelete,
  onDone,
}: FoodFormBodyProps) {
  const isEdit = Boolean(initialLog);
  const [rawText, setRawText] = useState(initialLog?.raw_text ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!rawText.trim()) {
      setError("Describe what you ate.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({ mealType, rawText });
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleDelete() {
    if (!onDelete) return;
    setError(null);
    startTransition(async () => {
      try {
        await onDelete();
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader>
        <DrawerTitle>{isEdit ? `Edit ${mealLabel}` : mealLabel}</DrawerTitle>
        <DrawerDescription>
          Write what you ate, in your own words.
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-col gap-2 overflow-y-auto px-4 py-4">
        <Textarea
          autoFocus
          rows={6}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={"1 bowl upma\n1 bowl watermelon"}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter>
        <Button type="submit" disabled={isPending}>
          {isEdit ? "Save changes" : "Add entry"}
        </Button>
        {isEdit && onDelete && (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
        <DrawerClose
          render={
            <Button type="button" variant="ghost" disabled={isPending}>
              Cancel
            </Button>
          }
        />
      </DrawerFooter>
    </form>
  );
}
