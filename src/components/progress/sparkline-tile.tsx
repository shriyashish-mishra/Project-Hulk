"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

interface SparklineTileProps {
  label: string;
  value: number | null;
  unit: string;
  data: Array<{ value: number | null }>;
  color?: string;
}

export function SparklineTile({
  label,
  value,
  unit,
  data,
  color = "var(--foreground)",
}: SparklineTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">
        {value ?? "—"}
        {value !== null && (
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
            {unit}
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
