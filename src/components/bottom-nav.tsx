"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, TrendingUp, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed, enabled: false },
  { href: "/workouts", label: "Workouts", icon: Dumbbell, enabled: false },
  { href: "/progress", label: "Progress", icon: TrendingUp, enabled: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon, enabled }) => {
          const isActive = pathname === href;

          if (!enabled) {
            return (
              <li key={href} className="flex-1">
                <span
                  aria-disabled="true"
                  title={`${label} — coming soon`}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 text-xs text-muted-foreground/40"
                >
                  <Icon className="size-5" />
                  {label}
                </span>
              </li>
            );
          }

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
