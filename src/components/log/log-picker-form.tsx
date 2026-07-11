"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { getLocalDateString } from "@/lib/date";

export function LogPickerForm() {
  const router = useRouter();
  const [date, setDate] = useState(getLocalDateString());

  function handleGo(event: FormEvent) {
    event.preventDefault();
    router.push(`/log/${date}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/more" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Log a day
        </h1>
        <p className="text-sm text-muted-foreground">
          Add or edit meals and workout for any date.
        </p>
      </div>

      <form onSubmit={handleGo} className="flex flex-col gap-4">
        <input
          type="date"
          value={date}
          max={getLocalDateString()}
          onChange={(e) => setDate(e.target.value)}
          required
          className="h-12 w-full rounded-2xl bg-muted px-4 text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit">Continue</Button>
      </form>
    </div>
  );
}
