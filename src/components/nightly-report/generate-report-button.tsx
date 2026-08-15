"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateReportNow } from "@/lib/nightly-report/actions";

interface GenerateReportButtonProps {
  date: string;
  reportHref: string;
  label: string;
  variant?: "default" | "ghost";
  size?: "default" | "sm";
}

/**
 * Generates the report directly via Gemini (`generateReportNow`) instead of
 * sending the user off to copy a prompt into Claude — that manual path
 * stays reachable as a fallback link if the automatic call fails, and
 * separately via the "Import a response" buttons next to this one.
 */
export function GenerateReportButton({ date, reportHref, label, variant, size }: GenerateReportButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      try {
        await generateReportNow(date);
        router.push(reportHref);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button variant={variant} size={size} onClick={handleGenerate} disabled={isPending}>
        {isPending ? "Generating…" : label}
      </Button>
      {error && (
        <p className="text-center text-xs text-destructive">
          {error}{" "}
          <Link href={`/report/generate?date=${date}`} className="underline underline-offset-4">
            Copy the prompt into Claude instead →
          </Link>
        </p>
      )}
    </div>
  );
}
