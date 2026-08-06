"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { formatShortDateWithWeekday } from "@/lib/date";
import type { WorkoutSession } from "@/lib/workout-sessions/types";

interface WorkoutHistoryListProps {
  sessions: WorkoutSession[];
}

/** Below this, a search box adds friction rather than removing it — every session is already visible without scrolling. */
const SEARCH_THRESHOLD = 8;

/** Every completed session, newest first, with a search-by-template-name box once history is long enough to need one — this list is deliberately unbounded, not a top-N recent list. */
export function WorkoutHistoryList({ sessions }: WorkoutHistoryListProps) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? sessions.filter((session) => session.template_name_snapshot.toLowerCase().includes(trimmed))
    : sessions;

  return (
    <div className="flex flex-col gap-2">
      {sessions.length > SEARCH_THRESHOLD && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by template name"
            className="h-10 w-full rounded-full border border-border bg-muted/40 pr-3 pl-8 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          {trimmed ? `No workouts match "${query}".` : "No completed workouts yet — finish a session to see it here."}
        </p>
      ) : (
        filtered.map((session) => (
          <Link
            key={session.id}
            href={`/workouts/session/${session.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 active:opacity-60"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{session.template_name_snapshot}</p>
              <p className="text-xs text-muted-foreground">
                {formatShortDateWithWeekday(new Date(session.completed_at ?? session.started_at))}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {session.total_calories !== null && (
                <span className="text-xs text-muted-foreground">{session.total_calories} kcal</span>
              )}
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
