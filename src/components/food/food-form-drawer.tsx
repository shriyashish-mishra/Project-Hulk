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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FOOD_UNITS } from "@/lib/food-logs/constants";
import type { FoodLogFormInput } from "@/lib/food-logs/actions";
import type { FoodLog, MealType } from "@/lib/food-logs/types";

interface FormFields {
  name: string;
  quantity: string;
  unit: string;
  calories: string;
  proteinGrams: string;
}

function emptyFields(): FormFields {
  return {
    name: "",
    quantity: "",
    unit: FOOD_UNITS[0],
    calories: "",
    proteinGrams: "",
  };
}

function fieldsFromLog(log: FoodLog): FormFields {
  return {
    name: log.name,
    quantity: String(log.quantity),
    unit: log.unit,
    calories: String(log.calories),
    proteinGrams: String(log.protein_grams),
  };
}

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
  const [fields, setFields] = useState<FormFields>(() =>
    initialLog ? fieldsFromLog(initialLog) : emptyFields(),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const quantity = Number(fields.quantity);
    const calories = Number(fields.calories);
    const proteinGrams = Number(fields.proteinGrams);

    if (!fields.name.trim()) {
      setError("Enter a food name.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    if (!Number.isFinite(calories) || calories < 0) {
      setError("Calories must be 0 or greater.");
      return;
    }
    if (!Number.isFinite(proteinGrams) || proteinGrams < 0) {
      setError("Protein must be 0 or greater.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await onSubmit({
          mealType,
          name: fields.name,
          quantity,
          unit: fields.unit,
          calories,
          proteinGrams,
        });
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
        <DrawerTitle>{isEdit ? "Edit food" : `Add to ${mealLabel}`}</DrawerTitle>
        <DrawerDescription>
          {isEdit ? mealLabel : "Enter calories and protein manually."}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="food-name">Food name</Label>
          <Input
            id="food-name"
            autoFocus
            value={fields.name}
            onChange={(e) =>
              setFields((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="e.g. Grilled chicken"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="food-quantity">Quantity</Label>
            <Input
              id="food-quantity"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={fields.quantity}
              onChange={(e) =>
                setFields((f) => ({ ...f, quantity: e.target.value }))
              }
              placeholder="1"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="food-unit">Unit</Label>
            <Select
              value={fields.unit}
              onValueChange={(value) =>
                setFields((f) => ({ ...f, unit: value ?? f.unit }))
              }
            >
              <SelectTrigger id="food-unit" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOOD_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="food-calories">Calories</Label>
            <Input
              id="food-calories"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={fields.calories}
              onChange={(e) =>
                setFields((f) => ({ ...f, calories: e.target.value }))
              }
              placeholder="0"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="food-protein">Protein (g)</Label>
            <Input
              id="food-protein"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={fields.proteinGrams}
              onChange={(e) =>
                setFields((f) => ({ ...f, proteinGrams: e.target.value }))
              }
              placeholder="0"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DrawerFooter>
        <Button type="submit" disabled={isPending}>
          {isEdit ? "Save changes" : "Add food"}
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
