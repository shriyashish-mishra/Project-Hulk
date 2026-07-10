import Link from "next/link";
import { cn } from "@/lib/utils";

export type ProgressTab = "daily" | "weekly" | "monthly";

const TABS: Array<{ key: ProgressTab; label: string; href: string }> = [
  { key: "daily", label: "Daily", href: "/progress" },
  { key: "weekly", label: "Weekly", href: "/progress/weekly" },
  { key: "monthly", label: "Monthly", href: "/progress/monthly" },
];

export function ProgressTabs({ active }: { active: ProgressTab }) {
  return (
    <div className="flex items-center gap-5 border-b border-border">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
            active === tab.key
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
