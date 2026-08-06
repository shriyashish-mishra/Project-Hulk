import Link from "next/link";
import {
  Camera,
  Clipboard,
  Dumbbell,
  Flame,
  MessageSquareText,
  NotebookText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: NotebookText,
    title: "Daily Journal",
    description:
      "Food, workouts, water, sleep, weight, progress photos, and optional cycle tracking — one place, logged in seconds.",
  },
  {
    icon: Dumbbell,
    title: "Workouts",
    description:
      "Build reusable templates, run live sessions with set-by-set tracking, and get weight suggestions snapped to real dumbbell, kettlebell, and machine increments — not made-up numbers.",
  },
  {
    icon: TrendingUp,
    title: "Progress",
    description:
      "Daily, weekly, and monthly views of your nutrition, training, recovery, and body trends — with a coach's narrative behind the numbers.",
  },
  {
    icon: Sparkles,
    title: "Coach Reports",
    description:
      "A personalized nightly report built from everything you logged that day — scored, summarized, and specific to you.",
  },
  {
    icon: Clipboard,
    title: "Saved Presets",
    description: "The meals and workouts you repeat, saved once and logged again in a single tap.",
  },
  {
    icon: Camera,
    title: "Progress Photos",
    description: "Front, side, and back views over time, private to your account and never shared automatically.",
  },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Log your day",
    description: "Meals, workout, water, sleep, weight — whatever you actually did, as it happens.",
  },
  {
    number: "02",
    title: "Generate tonight's report",
    description: "One tap builds a prompt from everything you logged today — no manual summarizing.",
  },
  {
    number: "03",
    title: "Paste into your own Claude",
    description: "Copy the prompt into a Claude conversation you control. Your data only ever goes where you send it.",
  },
  {
    number: "04",
    title: "Import your report",
    description: "Paste Claude's reply back in and get your scored, personalized coach report instantly.",
  },
] as const;

export default function WelcomePage() {
  return (
    <div className="flex flex-col gap-16 pt-2 pb-16">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-black tracking-tight text-foreground">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
            PH
          </span>
          Project Hulk
        </span>
        <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          Log in
        </Link>
      </header>

      <section className="flex flex-col gap-6 pt-4">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Your personal fitness OS</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground text-balance">
          Log everything. Let a coach make sense of it.
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Project Hulk tracks your food, training, sleep, and body trends in one daily habit — then turns it into a
          personalized coach report every night, built from your own data.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button nativeButton={false} render={<Link href="/signup" />} size="lg" className="sm:flex-1">
            Get Started
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            variant="outline"
            size="lg"
            className="sm:flex-1"
          >
            Log In
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-black tracking-tight text-foreground">Everything you need to log</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-4.5" />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">How your nightly report works</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Four steps, every night — and the one that matters most is entirely in your control.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex gap-4">
              <span className="shrink-0 text-2xl font-black tracking-tight text-primary/40 tabular-nums">
                {number}
              </span>
              <div className="border-l border-border pb-1 pl-4">
                <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="size-4.5" />
          </span>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Your data never leaves automatically.</span> Project
            Hulk builds the prompt — you decide when and where to paste it. Nothing is sent to any AI service on
            your behalf.
          </p>
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Flame className="size-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Ready to start?</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Free to use. Takes about two minutes to set up your profile.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/signup" />} size="lg" className="w-full sm:w-auto">
          Create your account
        </Button>
      </section>

      <footer className="flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquareText className="size-3.5" />
          <span>Built for people who&rsquo;d rather log once than think twice.</span>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
