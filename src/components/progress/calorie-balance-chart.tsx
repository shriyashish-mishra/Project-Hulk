"use client";

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer } from "recharts";
import { formatWeekdayShort } from "@/lib/date";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface CalorieBalanceChartProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

function formatBalanceLabel(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatChartLabel(value: unknown): string {
  return typeof value === "number" ? formatBalanceLabel(value) : "";
}

export function CalorieBalanceChart({ days, pointsByDate }: CalorieBalanceChartProps) {
  const data = days.map((date) => {
    const point = pointsByDate.get(date);
    return {
      label: formatWeekdayShort(new Date(`${date}T00:00:00`)),
      balance: point?.calorieBalanceKcal ?? null,
      // A day can have a report but still no balance figure (e.g. an
      // older import with unparseable free text) — that's still "has
      // data," just not this specific number. Only a day with no report
      // at all is genuinely "no data."
      hasReport: point !== undefined,
    };
  });

  const values = data.map((d) => d.balance).filter((v): v is number => v !== null);
  if (values.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No calorie balance data yet — re-import a report to see this.
      </p>
    );
  }

  const avgBalance = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  const isDeficit = avgBalance <= 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground">
        Averaging a{" "}
        <span className={isDeficit ? "font-semibold text-success" : "font-semibold text-warning"}>
          {Math.abs(avgBalance)} kcal {isDeficit ? "deficit" : "surplus"}
        </span>{" "}
        per day this week
      </p>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 0, left: 0, bottom: 0 }}>
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
                  fillOpacity={d.balance === null ? 0.4 : 1}
                />
              ))}
              <LabelList
                dataKey="balance"
                position="top"
                className="fill-muted-foreground text-[10px]"
                formatter={formatChartLabel}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between px-1">
        {data.map((d, index) => (
          <div key={index} className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
            <span className="text-[9px] font-medium text-muted-foreground/70">
              {d.balance !== null ? `${formatBalanceLabel(d.balance)}` : d.hasReport ? "n/a" : "No report"}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" /> Deficit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-warning" /> Surplus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted opacity-40" /> No report
        </span>
      </div>
    </div>
  );
}
