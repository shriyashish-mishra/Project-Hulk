"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { importAiReport } from "@/lib/nightly-report/actions";

export default function ImportReportPage() {
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
        await importAiReport(rawResponse);
        setIsImported(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  if (isImported) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary animate-success-pulse">
          <Sparkles className="size-7" />
        </span>
        <div className="animate-fade-up">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Today&rsquo;s Coach Report is Ready
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your nutrition, training, and tomorrow&rsquo;s plan — all in one
            place.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/report" />}
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
