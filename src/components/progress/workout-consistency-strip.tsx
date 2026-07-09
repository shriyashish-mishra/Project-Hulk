import { cn } from "@/lib/utils";
import { formatWeekdayShort } from "@/lib/date";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface WorkoutConsistencyStripProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

export function WorkoutConsistencyStrip({
  days,
  pointsByDate,
}: WorkoutConsistencyStripProps) {
  return (
    <div className="flex justify-between gap-1.5">
      {days.map((date) => {
        const point = pointsByDate.get(date);
        const hasReport = Boolean(point);
        const trained = (point?.musclesTrained.length ?? 0) > 0;

        return (
          <div key={date} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full border text-xs font-medium",
                trained
                  ? "border-success bg-success/15 text-success"
                  : hasReport
                    ? "border-border text-muted-foreground"
                    : "border-dashed border-border/60 text-muted-foreground/40",
              )}
            >
              {trained ? "✓" : hasReport ? "–" : "·"}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {formatWeekdayShort(new Date(`${date}T00:00:00`))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
