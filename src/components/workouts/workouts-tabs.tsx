import Link from "next/link";
import { cn } from "@/lib/utils";

export type WorkoutsTab = "templates" | "history" | "progress";

const TABS: Array<{ key: WorkoutsTab; label: string; href: string }> = [
  { key: "templates", label: "Templates", href: "/workouts" },
  { key: "history", label: "History", href: "/workouts/history" },
  { key: "progress", label: "Progress", href: "/workouts/progress" },
];

/** Mirrors `components/progress/progress-tabs.tsx`'s exact pattern — the Templates/History/Progress switcher at the top of every Workouts sub-page. */
export function WorkoutsTabs({ active }: { active: WorkoutsTab }) {
  return (
    <div className="flex items-center gap-5 border-b border-border">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
            active === tab.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
