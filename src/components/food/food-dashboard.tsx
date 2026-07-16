"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  deleteMealLog,
  saveMealLog,
  type MealLogInput,
} from "@/lib/food-logs/actions";
import {
  createFoodPreset,
  deleteFoodPreset,
  updateFoodPreset,
} from "@/lib/food-presets/actions";
import { MEAL_SECTIONS } from "@/lib/food-logs/constants";
import type { FoodLog, MealType } from "@/lib/food-logs/types";
import type { FoodPreset } from "@/lib/food-presets/types";
import { MealCard } from "./meal-card";

interface FoodDashboardProps {
  loggedOn: string;
  initialLogs: FoodLog[];
  initialPresets: FoodPreset[];
  userId: string;
}

type OptimisticAction =
  | { type: "save"; log: FoodLog }
  | { type: "clear"; mealType: MealType };

function reduceLogs(state: FoodLog[], action: OptimisticAction): FoodLog[] {
  switch (action.type) {
    case "save":
      return [
        ...state.filter((log) => log.meal_type !== action.log.meal_type),
        action.log,
      ];
    case "clear":
      return state.filter((log) => log.meal_type !== action.mealType);
  }
}

export function FoodDashboard({
  loggedOn,
  initialLogs,
  initialPresets,
  userId,
}: FoodDashboardProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [optimisticLogs, applyOptimistic] = useOptimistic(logs, reduceLogs);
  const [presets, setPresets] = useState(initialPresets);
  const [, startTransition] = useTransition();

  const logByMeal = useMemo(() => {
    const map = new Map<MealType, FoodLog>();
    for (const log of optimisticLogs) map.set(log.meal_type, log);
    return map;
  }, [optimisticLogs]);

  function handleSave(input: MealLogInput) {
    return new Promise<void>((resolve, reject) => {
      const existing = logByMeal.get(input.mealType);
      const optimisticEntry: FoodLog = {
        id: existing?.id ?? `optimistic-${crypto.randomUUID()}`,
        user_id: userId,
        meal_type: input.mealType,
        raw_text: input.rawText.trim(),
        logged_on: loggedOn,
        created_at: existing?.created_at ?? new Date().toISOString(),
      };
      startTransition(async () => {
        applyOptimistic({ type: "save", log: optimisticEntry });
        try {
          const saved = await saveMealLog(input, loggedOn);
          setLogs((prev) => [
            ...prev.filter((log) => log.meal_type !== input.mealType),
            saved,
          ]);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  function handleClear(mealType: MealType) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        applyOptimistic({ type: "clear", mealType });
        try {
          await deleteMealLog(mealType, loggedOn);
          setLogs((prev) => prev.filter((log) => log.meal_type !== mealType));
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async function handleCreatePreset(rawText: string) {
    const created = await createFoodPreset(rawText);
    setPresets((prev) => [...prev, created]);
    return created;
  }

  async function handleUpdatePreset(id: string, rawText: string) {
    const updated = await updateFoodPreset(id, rawText);
    setPresets((prev) => prev.map((preset) => (preset.id === id ? updated : preset)));
    return updated;
  }

  async function handleDeletePreset(id: string) {
    await deleteFoodPreset(id);
    setPresets((prev) => prev.filter((preset) => preset.id !== id));
  }

  return (
    <>
      {MEAL_SECTIONS.map((section) => (
        <MealCard
          key={section.type}
          mealType={section.type}
          label={section.label}
          log={logByMeal.get(section.type)}
          presets={presets}
          onSave={handleSave}
          onClear={handleClear}
          onCreatePreset={handleCreatePreset}
          onUpdatePreset={handleUpdatePreset}
          onDeletePreset={handleDeletePreset}
        />
      ))}
    </>
  );
}
