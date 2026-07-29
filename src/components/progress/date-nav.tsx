"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { getWeekStart } from "@/lib/date";

interface DateNavProps {
  label: string;
  prevHref: string;
  nextHref: string | null;
  /** The date (YYYY-MM-DD) the native picker opens showing — the exact day for Daily, that week's Monday for Weekly, the 1st of the month for Monthly. */
  pickerValue: string;
  /** Upper bound for the picker so the user can't jump into the future — typically today. */
  pickerMax: string;
  /** How to turn a picked date into this tab's URL — kept as plain, serializable data (not a function prop) since this renders under a Server Component page. */
  mode: "day" | "week" | "month";
  /** The route to navigate within, e.g. "/progress", "/progress/weekly", "/progress/monthly". */
  hrefBase: string;
}

function buildHrefForPickedDate(mode: DateNavProps["mode"], hrefBase: string, isoDate: string): string {
  if (mode === "day") return `${hrefBase}?date=${isoDate}`;
  if (mode === "week") return `${hrefBase}?start=${getWeekStart(isoDate)}`;
  return `${hrefBase}?month=${isoDate.slice(0, 7)}`;
}

/** Generic `< label >` navigation row — shared by the Daily, Weekly, and Monthly tabs. Tapping the label opens a native date picker to jump straight to any day/week/month instead of stepping one at a time. */
export function DateNav({
  label,
  prevHref,
  nextHref,
  pickerValue,
  pickerMax,
  mode,
  hrefBase,
}: DateNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const isoDate = event.target.value;
    if (!isoDate) return;
    setOpen(false);
    router.push(buildHrefForPickedDate(mode, hrefBase, isoDate));
  }

  return (
    <div className="flex items-center justify-between">
      <Link
        href={prevHref}
        aria-label="Previous"
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-transform active:scale-90"
      >
        <ChevronLeft className="size-4" />
      </Link>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger
          render={
            <button type="button" className="text-sm font-semibold text-foreground active:opacity-60">
              {label}
            </button>
          }
        />
        <DrawerContent>
          <DrawerHeader className="pt-2">
            <DrawerTitle className="text-2xl font-bold tracking-tight">Jump to date</DrawerTitle>
          </DrawerHeader>
          <div className="px-5 pb-8">
            <input
              type="date"
              autoFocus
              defaultValue={pickerValue}
              max={pickerMax}
              onChange={handlePick}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-[15px] text-foreground"
            />
          </div>
        </DrawerContent>
      </Drawer>

      {nextHref ? (
        <Link
          href={nextHref}
          aria-label="Next"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-transform active:scale-90"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span
          aria-hidden
          className="flex size-9 items-center justify-center text-muted-foreground/25"
        >
          <ChevronRight className="size-4" />
        </span>
      )}
    </div>
  );
}
