interface InsightBannerProps {
  insight: string;
}

/** A natural-language summary computed from this exercise's own session history — see `computeInsight` in `lib/workout-sessions/exercise-progress.ts` for how it's built. */
export function InsightBanner({ insight }: InsightBannerProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Insight</span>
      <p className="text-sm text-foreground">{insight}</p>
    </div>
  );
}
