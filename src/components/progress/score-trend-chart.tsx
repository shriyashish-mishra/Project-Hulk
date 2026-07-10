"use client";

import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type MouseHandlerDataParam,
} from "recharts";
import { formatWeekdayShort } from "@/lib/date";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface ScoreTrendChartProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

export function ScoreTrendChart({ days, pointsByDate }: ScoreTrendChartProps) {
  const router = useRouter();

  const data = days.map((date) => {
    const point = pointsByDate.get(date);
    return {
      date,
      label: formatWeekdayShort(new Date(`${date}T00:00:00`)),
      Overall: point?.overallScore ?? null,
      Nutrition: point?.nutritionScore ?? null,
      Workout: point?.workoutScore ?? null,
    };
  });

  function handleClick(state: MouseHandlerDataParam) {
    const index = state.activeIndex;
    if (typeof index !== "number") return;
    const clickedDate = days[index];
    if (clickedDate) router.push(`/report/${clickedDate}`);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Overall blends Nutrition and Workout into one daily score. Tap a point to open
        that day&rsquo;s report.
      </p>
      <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          onClick={handleClick}
          className="cursor-pointer"
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
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
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)" }}
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" iconSize={14} />
          <Line
            type="monotone"
            dataKey="Overall"
            stroke="var(--foreground)"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            animationDuration={450}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="Nutrition"
            stroke="var(--success)"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            animationDuration={450}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="Workout"
            stroke="var(--warning)"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            animationDuration={450}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
