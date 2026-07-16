"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, NotebookText, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Journal", icon: NotebookText, enabled: true },
  { href: "/workouts", label: "Workouts", icon: Dumbbell, enabled: false },
  { href: "/progress", label: "Progress", icon: TrendingUp, enabled: true },
] as const;

// Auth and onboarding are standalone flows, not app screens — showing nav
// tabs the user can't use yet (or that just bounce them back here) is
// confusing, not helpful.
const CHROMELESS_PATHS = [
  "/login",
  "/signup",
  "/reset-password",
  "/update-password",
  "/onboarding",
];

export function BottomNav() {
  const pathname = usePathname();

  if (CHROMELESS_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-5">
      <ul className="flex w-full max-w-xs items-stretch justify-around rounded-full border border-border bg-popover/90 px-2 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] backdrop-blur-xl supports-backdrop-filter:bg-popover/75">
        {NAV_ITEMS.map(({ href, label, icon: Icon, enabled }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          if (!enabled) {
            return (
              <li key={href}>
                <span
                  aria-disabled="true"
                  title={`${label} — coming soon`}
                  className="flex flex-col items-center gap-1 rounded-full px-4 py-2 text-[11px] font-medium text-muted-foreground/30"
                >
                  <Icon className="size-5" />
                  {label}
                </span>
              </li>
            );
          }

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-full px-4 py-2 text-[11px] font-medium transition-[color,transform] duration-150 active:scale-90",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    isActive && "scale-110",
                  )}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
