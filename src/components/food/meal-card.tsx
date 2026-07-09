"use client";

import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FoodFormDrawer } from "./food-form-drawer";
import type { MealLogInput } from "@/lib/food-logs/actions";
import type { FoodLog, MealType } from "@/lib/food-logs/types";

interface MealCardProps {
  mealType: MealType;
  label: string;
  log?: FoodLog;
  onSave: (input: MealLogInput) => Promise<void>;
  onClear: (mealType: MealType) => Promise<void>;
}

export function MealCard({ mealType, label, log, onSave, onClear }: MealCardProps) {
  const preview = log?.raw_text.split("\n").slice(0, 3).join("\n");

  return (
    <Card>
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
              className="flex w-full items-start justify-between gap-3 py-0.5 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{label}</span>
                {log ? (
                  <span className="mt-1 line-clamp-3 block whitespace-pre-line text-sm text-muted-foreground">
                    {preview}
                  </span>
                ) : (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Not logged
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  log
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {log && <Check className="size-3.5" />}
              </span>
            </button>
          }
        />
      </CardContent>
    </Card>
  );
}
