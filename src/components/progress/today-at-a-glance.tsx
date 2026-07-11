interface GlanceRow {
  label: string;
  value: string;
}

/** One consolidated list, not five separate metric cards. */
export function TodayAtGlance({ rows }: { rows: GlanceRow[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-2 text-sm">
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-medium text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
