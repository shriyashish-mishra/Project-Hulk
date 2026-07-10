import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavProps {
  label: string;
  prevHref: string;
  nextHref: string | null;
}

/** Generic `< label >` navigation row — shared by the Daily, Weekly, and Monthly tabs. */
export function DateNav({ label, prevHref, nextHref }: DateNavProps) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href={prevHref}
        aria-label="Previous"
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-transform active:scale-90"
      >
        <ChevronLeft className="size-4" />
      </Link>
      <span className="text-sm font-semibold text-foreground">{label}</span>
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
