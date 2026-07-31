"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { ExerciseProgression } from "@/lib/workout-sessions/progression";

function ExerciseProgressionTile({ progression }: { progression: ExerciseProgression }) {
  const latest = progression.points[progression.points.length - 1];
  const first = progression.points[0];
  const delta = Math.round((latest.weight - first.weight) * 100) / 100;
  const data = progression.points.map((point) => ({ value: point.weight }));

  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-muted p-3.5">
      <span className="text-xs text-muted-foreground">{progression.exercise_name}</span>
      <span className="text-lg font-semibold text-foreground">
        {latest.weight}
        <span className="text-xs font-normal text-muted-foreground"> {latest.weight_unit}</span>
      </span>
      {progression.points.length > 1 && (
        <span
          className={`text-xs font-medium ${
            delta > 0 ? "text-success" : delta < 0 ? "text-warning" : "text-muted-foreground"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta} {latest.weight_unit} since first logged
        </span>
      )}
      <div className="h-8 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--success)"
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

/** A stat-first tile per exercise (latest weight, big and readable) with a small trend line for context — same pattern as the Progress tab's nutrient tiles. Strength exercises only; nothing to progress for cardio. */
export function ExerciseProgressionSection({ progressions }: { progressions: ExerciseProgression[] }) {
  if (progressions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Complete a couple of sessions to see weight progression here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {progressions.map((progression) => (
        <ExerciseProgressionTile key={progression.exercise_id} progression={progression} />
      ))}
    </div>
  );
}
