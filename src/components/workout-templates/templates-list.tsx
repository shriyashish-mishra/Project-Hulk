"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTemplate } from "@/lib/workout-templates/actions";
import { startSessionFromTemplate } from "@/lib/workout-sessions/actions";
import type { WorkoutTemplate } from "@/lib/workout-templates/types";

interface TemplatesListProps {
  templates: WorkoutTemplate[];
}

/** "Start" copies the template straight into a new Active Session — nothing requires tapping through every set before completing, so this doubles as the quick "apply this template as today's workout" path. */
export function TemplatesList({ templates }: TemplatesListProps) {
  const router = useRouter();
  const [startingId, setStartingId] = useState<string | null>(null);
  const [creating, startCreating] = useTransition();

  function handleCreate() {
    startCreating(async () => {
      const template = await createTemplate("New Template");
      router.push(`/workouts/templates/${template.id}`);
    });
  }

  async function handleStart(templateId: string) {
    setStartingId(templateId);
    try {
      const session = await startSessionFromTemplate(templateId);
      router.push(`/workouts/session/${session.id}`);
    } finally {
      setStartingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {templates.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Build a template once, reuse it every time you repeat the workout.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
            >
              <Link href={`/workouts/templates/${template.id}`} className="min-w-0 flex-1 active:opacity-60">
                <p className="break-words text-[15px] font-semibold text-foreground">{template.name}</p>
                <p className="text-xs text-muted-foreground">Tap to edit</p>
              </Link>
              <Button size="sm" disabled={startingId === template.id} onClick={() => handleStart(template.id)}>
                <Play className="size-3.5" />
                Start
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button variant="secondary" disabled={creating} onClick={handleCreate}>
        <Plus className="size-4" />
        New Template
      </Button>
    </div>
  );
}
