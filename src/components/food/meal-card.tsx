"use client";

import { Check, Plus } from "lucide-react";
import { FoodFormDrawer } from "./food-form-drawer";
import type { MealLogInput } from "@/lib/food-logs/actions";
import type { FoodLog, MealType } from "@/lib/food-logs/types";
import type { FoodPreset } from "@/lib/food-presets/types";

const EMPTY_STATE_COPY: Record<MealType, string> = {
  breakfast: "Fuel your morning.",
  lunch: "Ready for lunch?",
  snacks: "Craving something?",
  dinner: "Wind down with dinner.",
};

interface MealCardProps {
  mealType: MealType;
  label: string;
  log?: FoodLog;
  presets: FoodPreset[];
  onSave: (input: MealLogInput) => Promise<void>;
  onClear: (mealType: MealType) => Promise<void>;
  onCreatePreset: (rawText: string) => Promise<FoodPreset>;
  onUpdatePreset: (id: string, rawText: string) => Promise<FoodPreset>;
  onDeletePreset: (id: string) => Promise<void>;
}

export function MealCard({
  mealType,
  label,
  log,
  presets,
  onSave,
  onClear,
  onCreatePreset,
  onUpdatePreset,
  onDeletePreset,
}: MealCardProps) {
  const preview = log?.raw_text.split("\n").slice(0, 3).join("\n");

  return (
    <FoodFormDrawer
      mealType={mealType}
      mealLabel={label}
      initialLog={log}
      presets={presets}
      onSubmit={onSave}
      onDelete={log ? () => onClear(mealType) : undefined}
      onCreatePreset={onCreatePreset}
      onUpdatePreset={onUpdatePreset}
      onDeletePreset={onDeletePreset}
      trigger={
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 py-4 text-left active:opacity-60"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold text-foreground">
              {label}
            </span>
            {log ? (
              <span className="mt-0.5 line-clamp-2 block whitespace-pre-line text-sm text-muted-foreground">
                {preview}
              </span>
            ) : (
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {EMPTY_STATE_COPY[mealType]}
              </span>
            )}
          </span>
          {log ? (
            <Check
              className="size-5 shrink-0 animate-check-pop text-primary"
              strokeWidth={2.5}
            />
          ) : (
            <Plus className="size-5 shrink-0 text-muted-foreground" strokeWidth={2} />
          )}
        </button>
      }
    />
  );
}
