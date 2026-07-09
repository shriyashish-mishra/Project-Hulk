"use client";

import { Check, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FoodFormDrawer } from "./food-form-drawer";
import type { MealLogInput } from "@/lib/food-logs/actions";
import type { FoodLog, MealType } from "@/lib/food-logs/types";

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
  onSave: (input: MealLogInput) => Promise<void>;
  onClear: (mealType: MealType) => Promise<void>;
  style?: React.CSSProperties;
}

export function MealCard({
  mealType,
  label,
  log,
  onSave,
  onClear,
  style,
}: MealCardProps) {
  const preview = log?.raw_text.split("\n").slice(0, 3).join("\n");

  return (
    <Card className="animate-fade-up" style={style}>
      <CardContent>
        <FoodFormDrawer
          mealType={mealType}
          mealLabel={label}
          initialLog={log}
          onSubmit={onSave}
          onDelete={log ? () => onClear(mealType) : undefined}
          trigger={
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 py-1 text-left transition-transform duration-150 active:scale-[0.98]"
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
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                  log
                    ? "animate-check-pop bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {log ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  <Plus className="size-4" strokeWidth={2.5} />
                )}
              </span>
            </button>
          }
        />
      </CardContent>
    </Card>
  );
}
