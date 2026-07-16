"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { getLocalDateString } from "@/lib/date";

export function DateSwitcher() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const today = getLocalDateString();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const date = event.target.value;
    if (date && date !== today) {
      router.push(`/log/${date}`);
    }
  }

  function openPicker() {
    const input = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
    }
  }

  return (
    <button
      type="button"
      onClick={openPicker}
      aria-label="Log a past day"
      className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary transition-transform duration-150 active:scale-90"
    >
      <CalendarClock className="size-[18px]" />
      <input
        ref={inputRef}
        type="date"
        defaultValue={today}
        max={today}
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </button>
  );
}
