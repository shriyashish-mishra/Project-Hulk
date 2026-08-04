import { ArrowDown, ArrowUp, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate, formatWeekdayShort } from "@/lib/date";
import { computeCalorieBalanceSummary } from "@/lib/progress/stats";
import type { DailyTrendPoint } from "@/lib/progress/types";

interface CalorieBalanceChartProps {
  days: string[];
  pointsByDate: Map<string, DailyTrendPoint>;
}

const PLOT_HEIGHT_PX = 176;
const NO_REPORT_BOX_HEIGHT_PX = 48;
const NICE_RESIDUALS = [1, 2, 2.5, 5, 10];

function formatBalanceLabel(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

/** Picks a "nice" gridline step (1/2/2.5/5/10 x a power of ten) that yields roughly 4 divisions. */
function niceStep(maxAbs: number): number {
  const rawStep = maxAbs / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const niceResidual = NICE_RESIDUALS.find((candidate) => residual <= candidate) ?? 10;
  return niceResidual * magnitude;
}

function computeAxisTicks(values: number[]): { domainMin: number; domainMax: number; ticks: number[] } {
  const maxAbs = Math.max(100, ...values.map((v) => Math.abs(v)));
  const step = niceStep(maxAbs);

  const maxPos = Math.max(0, ...values.filter((v) => v > 0));
  const maxNeg = Math.max(0, ...values.filter((v) => v < 0).map((v) => Math.abs(v)));

  const domainMax = maxPos > 0 ? Math.ceil(maxPos / step) * step : 0;
  const domainMin = -Math.ceil(Math.max(maxNeg, step) / step) * step;
  const ticks: number[] = [];
  for (let t = domainMax; t >= domainMin; t -= step) ticks.push(Math.round(t));

  return { domainMin, domainMax, ticks };
}

export function CalorieBalanceChart({ days, pointsByDate }: CalorieBalanceChartProps) {
  const summary = computeCalorieBalanceSummary(days, pointsByDate);

  if (summary.avgBalanceKcal === null) {
    return (
      <p className="text-sm text-muted-foreground">
        No calorie balance data yet — re-import a report to see this.
      </p>
    );
  }

  const data = days.map((date) => {
    const point = pointsByDate.get(date);
    return {
      date,
      weekday: formatWeekdayShort(new Date(`${date}T00:00:00`)),
      dateLabel: formatShortDate(new Date(`${date}T00:00:00`)),
      balance: point?.calorieBalanceKcal ?? null,
    };
  });

  const { domainMin, domainMax, ticks } = computeAxisTicks(
    data.map((d) => d.balance).filter((v): v is number => v !== null),
  );
  const range = domainMax - domainMin;
  const valueToPx = (value: number) => ((domainMax - value) / range) * PLOT_HEIGHT_PX;
  const zeroPx = valueToPx(0);

  const isNetDeficit = summary.netBalanceKcal <= 0;
  const consistency = summary.daysInDeficit / summary.daysWithBalance;
  const message =
    isNetDeficit && consistency >= 0.8
      ? null
      : isNetDeficit
        ? { text: "Averaging a deficit, but a few days slipped into surplus.", detail: "Small, steady deficits compound more than occasional big ones." }
        : { text: "You're averaging a surplus this week.", detail: "Fine for a build phase — just make sure it's an intentional one." };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl bg-muted p-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-success">
          <Flame className="size-5" strokeWidth={2.5} />
        </span>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {isNetDeficit ? "Avg Daily Deficit" : "Avg Daily Surplus"}
          </span>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {Math.abs(summary.avgBalanceKcal)}{" "}
            <span className="text-xs font-medium text-muted-foreground">kcal/day</span>
          </span>
          <span className="text-xs font-semibold text-success">
            {summary.daysInDeficit} of {summary.daysWithBalance} days in deficit
          </span>
        </div>
      </div>

      <div className="grid items-end gap-x-2" style={{ gridTemplateColumns: `2rem repeat(${days.length}, 1fr)` }}>
        <div />
        {data.map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-0.5 pb-1.5">
            <span className="text-[11px] font-semibold text-foreground">{d.weekday}</span>
            <span className="text-[10px] text-muted-foreground">{d.dateLabel}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-x-2" style={{ gridTemplateColumns: `2rem repeat(${days.length}, 1fr)` }}>
        <div className="relative" style={{ height: PLOT_HEIGHT_PX }}>
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-1 -translate-y-1/2 text-[10px] text-muted-foreground"
              style={{ top: valueToPx(t) }}
            >
              {t}
            </span>
          ))}
        </div>

        {data.map((d) => {
          const hasBalance = d.balance !== null;
          const barTopValue = hasBalance ? Math.max(d.balance!, 0) : 0;
          const barBottomValue = hasBalance ? Math.min(d.balance!, 0) : 0;
          const barTopPx = valueToPx(barTopValue);
          const barHeightPx = Math.max(3, valueToPx(barBottomValue) - barTopPx);
          const isSurplus = hasBalance && d.balance! > 0;

          return (
            <div key={d.date} className="relative" style={{ height: PLOT_HEIGHT_PX }}>
              {ticks.map((t) => (
                <div
                  key={t}
                  className={cn(
                    "absolute inset-x-0 border-t",
                    t === 0 ? "border-border" : "border-dashed border-border/60",
                  )}
                  style={{ top: valueToPx(t) }}
                />
              ))}

              {hasBalance ? (
                <>
                  <div
                    className={cn("absolute inset-x-0 rounded-[3px]", isSurplus ? "bg-warning" : "bg-success")}
                    style={{ top: barTopPx, height: barHeightPx }}
                  />
                  <span
                    className={cn(
                      "absolute inset-x-0 text-center text-[10px] font-semibold tabular-nums",
                      isSurplus ? "text-warning" : "text-success",
                    )}
                    style={
                      isSurplus
                        ? { top: barTopPx - 15 }
                        : { top: barTopPx + barHeightPx + 4 }
                    }
                  >
                    {formatBalanceLabel(d.balance!)}
                  </span>
                </>
              ) : (
                <div
                  className="absolute inset-x-1 flex items-center justify-center rounded-[3px] border border-dashed border-border/60 text-muted-foreground/50"
                  style={{ top: zeroPx, height: NO_REPORT_BOX_HEIGHT_PX }}
                >
                  &ndash;
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted p-3">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {isNetDeficit ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
            {isNetDeficit ? "Total Deficit" : "Total Surplus"}
          </span>
          <span className={cn("text-sm font-bold tabular-nums", isNetDeficit ? "text-success" : "text-warning")}>
            {Math.abs(summary.netBalanceKcal).toLocaleString()} kcal
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Flame className="size-3" />
            {isNetDeficit ? "Est. Fat Loss" : "Est. Fat Gain"}
          </span>
          <span className="text-sm font-bold tabular-nums text-foreground">{summary.estFatChangeKg} kg</span>
        </div>
        {summary.bestDay && (
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Trophy className="size-3" />
              Best Day
            </span>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                summary.bestDay.balanceKcal <= 0 ? "text-success" : "text-warning",
              )}
            >
              {formatWeekdayShort(new Date(`${summary.bestDay.date}T00:00:00`))}{" "}
              {formatBalanceLabel(summary.bestDay.balanceKcal)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" /> Deficit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-warning" /> Surplus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full border border-dashed border-border" /> No report
        </span>
      </div>

      {message && (
        <div className="flex flex-col gap-0.5 border-t border-border pt-3">
          <p className={cn("text-sm font-semibold", isNetDeficit ? "text-success" : "text-warning")}>
            {message.text}
          </p>
          <p className="text-xs text-muted-foreground">{message.detail}</p>
        </div>
      )}
    </div>
  );
}
