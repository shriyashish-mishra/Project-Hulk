"use client";

import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";
import { formatWeekdayShort } from "@/lib/date";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface NutritionTrendChartProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

/**
 * Two single-axis mini charts, not one dual-axis chart — calories and protein
 * live on very different scales, and a shared y-axis would flatten protein
 * to a near-straight line.
 */
export function NutritionTrendChart({ days, pointsByDate }: NutritionTrendChartProps) {
  const data = days.map((date) => {
    const point = pointsByDate.get(date);
    return {
      label: formatWeekdayShort(new Date(`${date}T00:00:00`)),
      calories: point?.estimatedCalories ?? null,
      protein: point?.proteinG ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Calories</span>
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Bar dataKey="calories" fill="var(--muted-foreground)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Protein</span>
        <div className="h-16 w-full">
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
      <div className="flex justify-between px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
