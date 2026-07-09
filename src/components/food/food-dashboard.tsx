"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { getLocalDateString } from "@/lib/date";
import {
  addFoodLog,
  deleteFoodLog,
  updateFoodLog,
  type FoodLogFormInput,
} from "@/lib/food-logs/actions";
import {
  DEFAULT_DAILY_CALORIE_TARGET,
  DEFAULT_DAILY_PROTEIN_TARGET_G,
  MEAL_SECTIONS,
} from "@/lib/food-logs/constants";
import type { FoodLog, MealType } from "@/lib/food-logs/types";
import { MealSection } from "./meal-section";
import { SummaryCards } from "./summary-cards";

interface FoodDashboardProps {
  initialLogs: FoodLog[];
}

type OptimisticAction =
  | { type: "add"; log: FoodLog }
  | { type: "update"; log: FoodLog }
  | { type: "delete"; id: string };

function reduceLogs(state: FoodLog[], action: OptimisticAction): FoodLog[] {
  switch (action.type) {
    case "add":
      return [...state, action.log];
    case "update":
      return state.map((log) => (log.id === action.log.id ? action.log : log));
    case "delete":
      return state.filter((log) => log.id !== action.id);
  }
}

export function FoodDashboard({ initialLogs }: FoodDashboardProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [optimisticLogs, applyOptimistic] = useOptimistic(logs, reduceLogs);
  const [, startTransition] = useTransition();
  const loggedOn = useMemo(() => getLocalDateString(), []);

  const logsByMeal = useMemo(() => {
    const map = new Map<MealType, FoodLog[]>();
    for (const section of MEAL_SECTIONS) map.set(section.type, []);
    for (const log of optimisticLogs) map.get(log.meal_type)?.push(log);
    return map;
  }, [optimisticLogs]);

  const totals = useMemo(
    () =>
      optimisticLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein_grams,
        }),
        { calories: 0, protein: 0 },
      ),
    [optimisticLogs],
  );

  const remainingCalories = DEFAULT_DAILY_CALORIE_TARGET - totals.calories;
  const remainingProtein = DEFAULT_DAILY_PROTEIN_TARGET_G - totals.protein;
  const caloriesProgress = Math.min(
    100,
    (totals.calories / DEFAULT_DAILY_CALORIE_TARGET) * 100,
  );
  const proteinProgress = Math.min(
    100,
    (totals.protein / DEFAULT_DAILY_PROTEIN_TARGET_G) * 100,
  );

  function handleAdd(input: FoodLogFormInput) {
    return new Promise<void>((resolve, reject) => {
      const optimisticEntry: FoodLog = {
        id: `optimistic-${crypto.randomUUID()}`,
        meal_type: input.mealType,
        name: input.name.trim(),
        quantity: input.quantity,
        unit: input.unit.trim(),
        calories: Math.round(input.calories),
        protein_grams: input.proteinGrams,
        logged_on: loggedOn,
        created_at: new Date().toISOString(),
      };
      startTransition(async () => {
        applyOptimistic({ type: "add", log: optimisticEntry });
        try {
          const saved = await addFoodLog(input);
          setLogs((prev) => [...prev, saved]);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  function handleUpdate(id: string, input: FoodLogFormInput) {
    return new Promise<void>((resolve, reject) => {
      const existing = logs.find((log) => log.id === id);
      const optimisticEntry: FoodLog = {
        id,
        meal_type: input.mealType,
        name: input.name.trim(),
        quantity: input.quantity,
        unit: input.unit.trim(),
        calories: Math.round(input.calories),
        protein_grams: input.proteinGrams,
        logged_on: existing?.logged_on ?? loggedOn,
        created_at: existing?.created_at ?? new Date().toISOString(),
      };
      startTransition(async () => {
        applyOptimistic({ type: "update", log: optimisticEntry });
        try {
          const saved = await updateFoodLog(id, input);
          setLogs((prev) => prev.map((log) => (log.id === id ? saved : log)));
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  function handleDelete(id: string) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        applyOptimistic({ type: "delete", id });
        try {
          await deleteFoodLog(id);
          setLogs((prev) => prev.filter((log) => log.id !== id));
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <SummaryCards
        caloriesConsumed={totals.calories}
        proteinConsumed={totals.protein}
        remainingCalories={remainingCalories}
        remainingProtein={remainingProtein}
        caloriesProgress={caloriesProgress}
        proteinProgress={proteinProgress}
      />

      <div className="flex flex-col gap-3">
        {MEAL_SECTIONS.map((section) => (
          <MealSection
            key={section.type}
            mealType={section.type}
            label={section.label}
            logs={logsByMeal.get(section.type) ?? []}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
