"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatWeekdayShort } from "@/lib/date";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface ScoreTrendChartProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

export function ScoreTrendChart({ days, pointsByDate }: ScoreTrendChartProps) {
  const data = days.map((date) => {
    const point = pointsByDate.get(date);
    return {
      label: formatWeekdayShort(new Date(`${date}T00:00:00`)),
      Overall: point?.overallScore ?? null,
      Nutrition: point?.nutritionScore ?? null,
      Workout: point?.workoutScore ?? null,
    };
  });

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            interval={0}
            padding={{ left: 12, right: 12 }}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              borderColor: "var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" iconSize={14} />
          <Line
            type="monotone"
            dataKey="Overall"
            stroke="var(--foreground)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Nutrition"
            stroke="var(--success)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Workout"
            stroke="var(--warning)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
