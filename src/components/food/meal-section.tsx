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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{label}</CardTitle>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {logs.length} {logs.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {logs.length === 0 ? (
          <p className="py-1 text-sm text-muted-foreground">
            Nothing logged yet.
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
                      className="w-full whitespace-pre-line py-2.5 text-left text-sm"
                    >
                      {log.raw_text}
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
              Add to {label.toLowerCase()}
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
