"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ExerciseHistoryEntry, WeightRecommendation } from "@/lib/workout-sessions/exercise-progress";

function formatChartDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ProgressionChartProps {
  history: ExerciseHistoryEntry[];
  recommendation: WeightRecommendation;
}

/**
 * Actual weight per completed session plus a dashed continuation to the
 * next-weight recommendation — the same number the recommendation card
 * shows, so the two never disagree. Two overlapping `Line`s (one solid
 * for `actual`, one dashed for `projected`) sharing the same category
 * axis is the standard recharts technique for a styled projection
 * segment; the last actual point is duplicated as the projection's
 * starting point so the two lines visually connect.
 */
export function ProgressionChart({ history, recommendation }: ProgressionChartProps) {
  const withWeight = history.filter((entry): entry is ExerciseHistoryEntry & { weight: number } => entry.weight !== null);
  const chronological = withWeight.slice().reverse();

  if (chronological.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        No completed sessions yet — this chart fills in as you log workouts.
      </p>
    );
  }

  const data: Array<{ label: string; actual: number | null; projected: number | null }> = chronological.map(
    (entry) => ({
      label: formatChartDate(entry.completed_at),
      actual: entry.weight,
      projected: null,
    }),
  );

  if (recommendation.action === "increase" && recommendation.next_weight !== null) {
    const last = data[data.length - 1];
    last.projected = last.actual;
    data.push({ label: "Next", actual: null, projected: recommendation.next_weight });
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip
            contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="var(--success)"
            strokeWidth={2.5}
            dot={{ r: 3.5, strokeWidth: 0 }}
            connectNulls={false}
            animationDuration={400}
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="Projected"
            stroke="var(--warning)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4, strokeWidth: 0 }}
            connectNulls
            animationDuration={400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
