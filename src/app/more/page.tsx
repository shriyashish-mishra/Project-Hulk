import Link from "next/link";
import {
  Camera,
  Scale,
  Moon,
  Droplet,
  MessageCircle,
  Bell,
  CalendarClock,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { logOut } from "@/lib/auth/actions";
import { requireOnboardedUser } from "@/lib/supabase/auth";

const QUICK_LINKS = [
  {
    href: "/log",
    icon: CalendarClock,
    label: "Log a past day",
    description: "Add or edit meals and workout for any date.",
  },
  {
    href: "/",
    icon: Scale,
    label: "Weight",
    description: "Log today's weight from the Daily Signals row.",
  },
  {
    href: "/photos",
    icon: Camera,
    label: "Progress Photos",
    description: "Front, side, and back views over time.",
  },
  {
    href: "/",
    icon: Moon,
    label: "Sleep",
    description: "Log last night's duration from Daily Signals.",
  },
  {
    href: "/",
    icon: Droplet,
    label: "Water",
    description: "Log today's glasses from Daily Signals.",
  },
] as const;

const COMING_SOON = [
  {
    icon: MessageCircle,
    label: "Coach Chat",
    description: "Ask your AI coach questions anytime.",
  },
  {
    icon: Bell,
    label: "AI Notifications",
    description: "Gentle nudges when it's time to log.",
  },
] as const;

export default async function MorePage() {
  const { user } = await requireOnboardedUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          More
        </h1>
      </div>

      <Card className="animate-fade-up">
        <CardContent className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary">
            PH
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground">
              Project Hulk
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-up" style={{ animationDelay: "50ms" }}>
        <CardContent className="divide-y divide-border">
          {QUICK_LINKS.map(({ href, icon: Icon, label, description }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0 active:opacity-60"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Coming soon
        </p>
        <Card className="animate-fade-up">
          <CardContent className="divide-y divide-border">
            {COMING_SOON.map(({ icon: Icon, label, description }) => (
              <div key={label} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  Soon
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-up">
        <CardContent>
          <form action={logOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3.5 text-left active:opacity-60"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-destructive">
                <LogOut className="size-5" />
              </span>
              <span className="text-sm font-semibold text-destructive">
                Log out
              </span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
