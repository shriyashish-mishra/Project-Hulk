import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MealType } from "@/lib/food-logs/types";

interface SummaryCardsProps {
  mealsLoggedToday: number;
  completedMeals: ReadonlyArray<{
    type: MealType;
    label: string;
    done: boolean;
  }>;
}

export function SummaryCards({
  mealsLoggedToday,
  completedMeals,
}: SummaryCardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {mealsLoggedToday === 0
            ? "No meals logged yet."
            : `${mealsLoggedToday} ${mealsLoggedToday === 1 ? "entry" : "entries"} logged today.`}
        </p>

        <ul className="grid grid-cols-4 gap-2">
          {completedMeals.map((meal) => (
            <li
              key={meal.type}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-border py-2.5"
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border",
                  meal.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {meal.done && <Check className="size-3.5" />}
              </span>
              <span className="text-xs text-muted-foreground">
                {meal.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
