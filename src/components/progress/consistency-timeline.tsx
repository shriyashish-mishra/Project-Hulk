import { cn } from "@/lib/utils";
import { formatWeekdayShort } from "@/lib/date";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface ConsistencyTimelineProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

export function ConsistencyTimeline({ days, pointsByDate }: ConsistencyTimelineProps) {
  return (
    <div className="flex justify-between gap-1.5">
      {days.map((date) => {
        const point = pointsByDate.get(date);
        const hasReport = Boolean(point);
        const trained = (point?.musclesTrained.length ?? 0) > 0;

        return (
          <div key={date} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={cn(
                "size-2 rounded-full",
                trained
                  ? "bg-primary"
                  : hasReport
                    ? "bg-muted-foreground/40"
                    : "border border-dashed border-border",
              )}
            />
            <span className="text-[10px] text-muted-foreground">
              {formatWeekdayShort(new Date(`${date}T00:00:00`))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
