import { cn } from "@/lib/utils";
import type { MicronutrientNote } from "@/lib/nightly-report/types";

interface MicronutrientListProps {
  micronutrients: MicronutrientNote[];
}

/** Vitamin/mineral status notes — shared by the Report page and Progress's Today's Nutrition card so the two never drift apart. */
export function MicronutrientList({ micronutrients }: MicronutrientListProps) {
  if (micronutrients.length === 0) return null;

  return (
    <ul className="flex flex-col divide-y divide-border">
      {micronutrients.map((note) => (
        <li key={note.name} className="flex items-center justify-between gap-2 py-1.5 text-sm">
          <span>
            {note.name}
            {note.note && (
              <span className="ml-1.5 text-xs text-muted-foreground">{note.note}</span>
            )}
          </span>
          <span
            className={cn(
              "shrink-0 text-xs font-medium capitalize",
              note.status === "low" ? "text-warning" : "text-success",
            )}
          >
            {note.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
