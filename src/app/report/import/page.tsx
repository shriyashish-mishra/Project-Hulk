"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { importAiReport } from "@/lib/nightly-report/actions";
import { formatDateHeading, getLocalDateString } from "@/lib/date";

export default function ImportReportPage() {
  const today = getLocalDateString();
  const [reportDate, setReportDate] = useState(today);
  const [rawResponse, setRawResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isImported, setIsImported] = useState(false);

  function handleImport() {
    if (!rawResponse.trim()) {
      setError("Paste the response from Claude first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await importAiReport(rawResponse, reportDate);
        setIsImported(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  if (isImported) {
    const isToday = reportDate === today;
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary animate-success-pulse">
          <Sparkles className="size-7" />
        </span>
        <div className="animate-fade-up">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isToday ? "Today's Coach Report is Ready" : "Coach Report Imported"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isToday
              ? "Your nutrition, training, and tomorrow's plan — all in one place."
              : `Saved for ${formatDateHeading(new Date(`${reportDate}T00:00:00`))}.`}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={`/report/${reportDate}`} />}
          className="mt-2"
        >
          View Insights →
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Import AI Report
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste Claude&rsquo;s full reply below — the JSON block is extracted
          automatically.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="report-date"
          className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase"
        >
          Report date
        </label>
        <input
          id="report-date"
          type="date"
          value={reportDate}
          max={today}
          onChange={(e) => setReportDate(e.target.value)}
          className="h-12 w-full rounded-2xl bg-muted px-4 text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <Textarea
        autoFocus
        rows={14}
        value={rawResponse}
        onChange={(e) => setRawResponse(e.target.value)}
        placeholder="Paste the full response from Claude here..."
        className="min-h-72 resize-none font-mono text-xs"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleImport} disabled={isPending}>
        {isPending ? "Importing…" : "Import"}
      </Button>
    </div>
  );
}
