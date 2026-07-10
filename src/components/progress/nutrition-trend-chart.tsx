"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface NutritionTrendChartProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

function average(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length);
}

function NutrientTile({
  label,
  unit,
  values,
  color,
}: {
  label: string;
  unit: string;
  values: Array<number | null>;
  color: string;
}) {
  const avg = average(values);
  const data = values.map((value) => ({ value }));

  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-muted p-3.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-foreground">
        {avg !== null ? avg : "—"}
        {avg !== null && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit} avg
          </span>
        )}
      </span>
      <div className="h-8 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * A stat-first tile per nutrient (the period average, big and readable) with
 * a small trend line for context — not a bare unlabeled chart. Four separate
 * tiles rather than one dual-axis chart, since calories/protein/carbs/fat
 * live on very different scales.
 */
export function NutritionTrendChart({ days, pointsByDate }: NutritionTrendChartProps) {
  const caloriesValues = days.map((d) => pointsByDate.get(d)?.estimatedCalories ?? null);
  const proteinValues = days.map((d) => pointsByDate.get(d)?.proteinG ?? null);
  const carbsValues = days.map((d) => pointsByDate.get(d)?.carbsG ?? null);
  const fatValues = days.map((d) => pointsByDate.get(d)?.fatG ?? null);

  return (
    <div className="grid grid-cols-2 gap-3">
      <NutrientTile
        label="Calories"
        unit="kcal"
        values={caloriesValues}
        color="var(--muted-foreground)"
      />
      <NutrientTile
        label="Protein"
        unit="g"
        values={proteinValues}
        color="var(--success)"
      />
      <NutrientTile
        label="Carbs"
        unit="g"
        values={carbsValues}
        color="var(--muted-foreground)"
      />
      <NutrientTile label="Fat" unit="g" values={fatValues} color="var(--muted-foreground)" />
    </div>
  );
}
