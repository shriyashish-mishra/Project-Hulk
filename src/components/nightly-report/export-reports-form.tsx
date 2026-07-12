"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getLocalDateString } from "@/lib/date";

interface ExportReportsFormProps {
  defaultStart: string;
}

export function ExportReportsForm({ defaultStart }: ExportReportsFormProps) {
  const today = getLocalDateString();
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(today);

  const isValidRange = start <= end;

  function handleDownload() {
    if (!isValidRange) return;
    window.location.href = `/api/reports/export?start=${start}&end=${end}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="export-start">From</Label>
        <input
          id="export-start"
          type="date"
          value={start}
          max={today}
          onChange={(e) => setStart(e.target.value)}
          className="h-12 w-full rounded-2xl bg-muted px-4 text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="export-end">To</Label>
        <input
          id="export-end"
          type="date"
          value={end}
          max={today}
          onChange={(e) => setEnd(e.target.value)}
          className="h-12 w-full rounded-2xl bg-muted px-4 text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {!isValidRange && (
        <p className="text-sm text-destructive">&ldquo;From&rdquo; must be before or equal to &ldquo;To&rdquo;.</p>
      )}

      <Button type="button" disabled={!isValidRange} className="gap-1.5" onClick={handleDownload}>
        <Download className="size-4" />
        Download CSV
      </Button>

      <p className="text-xs text-muted-foreground">
        Exports your coach reports (scores, macros, muscles trained, coach
        notes) for each day in the range as a spreadsheet — days without a
        generated report are simply skipped.
      </p>
    </div>
  );
}
