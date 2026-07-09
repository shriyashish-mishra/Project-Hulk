"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodFormDrawer } from "./food-form-drawer";
import type { FoodLogFormInput } from "@/lib/food-logs/actions";
import type { FoodLog, MealType } from "@/lib/food-logs/types";

interface MealSectionProps {
  mealType: MealType;
  label: string;
  logs: FoodLog[];
  onAdd: (input: FoodLogFormInput) => Promise<void>;
  onUpdate: (id: string, input: FoodLogFormInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MealSection({
  mealType,
  label,
  logs,
  onAdd,
  onUpdate,
  onDelete,
}: MealSectionProps) {
  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = logs.reduce((sum, log) => sum + log.protein_grams, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{label}</CardTitle>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalCalories} kcal · {totalProtein.toFixed(0)}g protein
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {logs.length === 0 ? (
          <p className="py-1 text-sm text-muted-foreground">
            No foods logged yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {logs.map((log) => (
              <li key={log.id}>
                <FoodFormDrawer
                  mealType={mealType}
                  mealLabel={label}
                  initialLog={log}
                  onSubmit={(input) => onUpdate(log.id, input)}
                  onDelete={() => onDelete(log.id)}
                  trigger={
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {log.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {log.quantity} {log.unit}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-xs text-muted-foreground">
                        <span className="block font-medium text-foreground">
                          {log.calories} kcal
                        </span>
                        <span className="block">
                          {log.protein_grams.toFixed(0)}g protein
                        </span>
                      </span>
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        )}

        <FoodFormDrawer
          mealType={mealType}
          mealLabel={label}
          onSubmit={onAdd}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 justify-start gap-1.5 text-muted-foreground"
            >
              <Plus className="size-4" />
              Add food
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
