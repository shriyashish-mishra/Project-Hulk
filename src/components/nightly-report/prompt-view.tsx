"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromptViewProps {
  prompt: string;
}

function subscribeNever() {
  return () => {};
}

function getCanShareSnapshot() {
  return typeof navigator.share === "function";
}

function getCanShareServerSnapshot() {
  return false;
}

export function PromptView({ prompt }: PromptViewProps) {
  const [copied, setCopied] = useState(false);
  const canShare = useSyncExternalStore(
    subscribeNever,
    getCanShareSnapshot,
    getCanShareServerSnapshot,
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    try {
      await navigator.share({
        title: "Project Hulk — Nightly Report Prompt",
        text: prompt,
      });
    } catch {
      // User dismissed the share sheet — not an error.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button onClick={handleCopy} className="flex-1 gap-1.5">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy Prompt"}
        </Button>
        {canShare && (
          <Button variant="outline" onClick={handleShare} className="gap-1.5">
            <Share2 className="size-4" />
            Share
          </Button>
        )}
      </div>
      <pre className="max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
        {prompt}
      </pre>
    </div>
  );
}
