"use client";

import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";
import { formatWeekdayShort } from "@/lib/date";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface NutritionTrendChartProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

interface Row {
  label: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

function MiniBarRow({ label, dataKey, data, color }: {
  label: string;
  dataKey: keyof Row;
  data: Row[];
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Small multiples, not one dual-axis chart — calories, protein, carbs, and
 * fat all live on different scales, and a shared y-axis would flatten the
 * smaller ones to near-straight lines.
 */
export function NutritionTrendChart({ days, pointsByDate }: NutritionTrendChartProps) {
  const data: Row[] = days.map((date) => {
    const point = pointsByDate.get(date);
    return {
      label: formatWeekdayShort(new Date(`${date}T00:00:00`)),
      calories: point?.estimatedCalories ?? null,
      protein: point?.proteinG ?? null,
      carbs: point?.carbsG ?? null,
      fat: point?.fatG ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Calories</span>
        <div className="h-14 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Bar
                dataKey="calories"
                fill="var(--muted-foreground)"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Protein</span>
        <div className="h-14 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Line
                type="monotone"
                dataKey="protein"
                stroke="var(--success)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: "var(--success)" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <MiniBarRow label="Carbs" dataKey="carbs" data={data} color="var(--muted-foreground)" />
      <MiniBarRow label="Fat" dataKey="fat" data={data} color="var(--muted-foreground)" />
      <div className="flex justify-between px-1">
        {data.map((d, index) => (
          <span key={index} className="text-[10px] text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
