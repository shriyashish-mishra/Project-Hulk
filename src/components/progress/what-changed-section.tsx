export type ChangeDirection = "up" | "down" | "flat";

export interface ChangeRow {
  label: string;
  direction: ChangeDirection;
}

const ARROW: Record<ChangeDirection, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

/**
 * Plain, uncoloured arrows on purpose — "up" isn't universally good (a
 * rising weight trend isn't the same win as rising training consistency),
 * so the label carries the meaning, not a green/red signal.
 */
export function WhatChangedSection({ rows }: { rows: ChangeRow[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-2 text-sm">
          <span className="text-muted-foreground">{row.label}</span>
          <span className="text-base font-semibold text-foreground">{ARROW[row.direction]}</span>
        </div>
      ))}
    </div>
  );
}
