"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { importAiReport } from "@/lib/nightly-report/actions";

export default function ImportReportPage() {
  const router = useRouter();
  const [rawResponse, setRawResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleImport() {
    if (!rawResponse.trim()) {
      setError("Paste the response from Claude first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await importAiReport(rawResponse);
        router.push("/report");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
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
