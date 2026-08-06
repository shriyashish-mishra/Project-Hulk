"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentExercise } from "@/lib/workout-sessions/exercise-progress";

interface ExercisePickerStripProps {
  exercises: RecentExercise[];
  /** Matched case-insensitively — a report-only exercise has no `exercise_id` to key by, so name is the one identifier every exercise always has. */
  selectedExerciseName: string;
}

/** Below this, a search box adds friction rather than removing it — every exercise is already one glance away in the strip. */
const SEARCH_THRESHOLD = 8;

/** Horizontal chip strip — every strength exercise ever completed or mentioned with a weight in a report, most recently trained first, selected one bordered mint. Plain links (`?exercise=name`), so selecting one is still a real navigation, matching this page's server-rendered pattern — only the filtering itself is client-side. */
export function ExercisePickerStrip({ exercises, selectedExerciseName }: ExercisePickerStripProps) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed ? exercises.filter((exercise) => exercise.name.toLowerCase().includes(trimmed)) : exercises;

  return (
    <div className="flex flex-col gap-2">
      {exercises.length > SEARCH_THRESHOLD && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises"
            className="h-9 w-full rounded-full border border-border bg-muted/40 pr-3 pl-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filtered.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No exercises match &ldquo;{query}&rdquo;.</p>
        ) : (
          filtered.map((exercise) => {
            const selected = exercise.name.toLowerCase() === selectedExerciseName.toLowerCase();
            return (
              <Link
                key={exercise.name}
                href={`/workouts/progress?exercise=${encodeURIComponent(exercise.name)}`}
                className={cn(
                  "shrink-0 rounded-2xl border px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  selected
                    ? "border-primary text-primary"
                    : "border-border text-foreground hover:border-muted-foreground",
                )}
              >
                {exercise.name}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
