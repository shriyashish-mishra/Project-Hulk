"use client";

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer } from "recharts";
import { formatWeekdayShort } from "@/lib/date";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface CalorieBalanceChartProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

export function CalorieBalanceChart({ days, pointsByDate }: CalorieBalanceChartProps) {
  const data = days.map((date) => {
    const point = pointsByDate.get(date);
    return {
      label: formatWeekdayShort(new Date(`${date}T00:00:00`)),
      balance: point?.calorieBalanceKcal ?? null,
    };
  });

  const hasData = data.some((d) => d.balance !== null);
  if (!hasData) {
    return (
      <p className="text-sm text-muted-foreground">
        No calorie balance data yet — re-import a report to see this.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <ReferenceLine y={0} stroke="var(--border)" />
            <Bar dataKey="balance" radius={[3, 3, 3, 3]} isAnimationActive={false}>
              {data.map((d, index) => (
                <Cell
                  key={index}
                  fill={
                    d.balance === null
                      ? "var(--muted)"
                      : d.balance <= 0
                        ? "var(--success)"
                        : "var(--warning)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between px-1">
        {data.map((d, index) => (
          <span key={index} className="text-[10px] text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" /> Deficit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-warning" /> Surplus
        </span>
      </div>
    </div>
  );
}
