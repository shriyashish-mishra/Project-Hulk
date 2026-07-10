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
import { requireUser } from "@/lib/supabase/auth";

const COMING_SOON = [
  {
    icon: Scale,
    label: "Weight",
    description: "Track bodyweight trends over time.",
  },
  {
    icon: Camera,
    label: "Progress Photos",
    description: "Visual proof of the work you're putting in.",
  },
  {
    icon: Moon,
    label: "Sleep",
    description: "See how rest connects to recovery.",
  },
  {
    icon: Droplet,
    label: "Water",
    description: "Simple daily hydration tracking.",
  },
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
  const { user } = await requireUser();

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
        <CardContent>
          <Link
            href="/log"
            className="flex items-center gap-3.5 active:opacity-60"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
              <CalendarClock className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Log a past day
              </p>
              <p className="text-xs text-muted-foreground">
                Add or edit meals and workout for any date.
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Coming soon
        </p>
        <div className="flex flex-col gap-3">
          {COMING_SOON.map(({ icon: Icon, label, description }, index) => (
            <Card
              key={label}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="flex items-center gap-3.5">
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
              </CardContent>
            </Card>
          ))}
        </div>
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
