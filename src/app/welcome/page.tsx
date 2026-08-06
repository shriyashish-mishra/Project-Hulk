import type { ReactNode } from "react";
import Link from "next/link";
import {
  Battery,
  Bookmark,
  Camera,
  CheckCircle2,
  ChevronDown,
  Copy,
  Dumbbell,
  Flame,
  NotebookText,
  Plus,
  ShieldCheck,
  Signal,
  Sparkles,
  TrendingUp,
  Wand2,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WelcomeHeader } from "@/components/welcome/welcome-header";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Your data stays private" },
  { icon: Wand2, label: "2-minute setup" },
  { icon: Dumbbell, label: "Built for mobile" },
] as const;

const FEATURES = [
  {
    icon: NotebookText,
    title: "Daily Journal",
    description: "Log food, water, sleep, weight, cycle & more in seconds.",
  },
  {
    icon: Dumbbell,
    title: "Workouts",
    description: "Reusable templates, live sessions & smart progression.",
  },
  {
    icon: TrendingUp,
    title: "Progress Insights",
    description: "Daily, weekly & monthly trends with coach-style commentary.",
  },
  {
    icon: Sparkles,
    title: "Coach Reports",
    description: "Personalized nightly report scored & summarized for you.",
  },
  {
    icon: Bookmark,
    title: "Saved Presets",
    description: "Meals & workouts saved once, log again in one tap.",
  },
  {
    icon: Camera,
    title: "Progress Photos",
    description: "Track front, side & back photos, private to your account.",
  },
] as const;

const STEPS = [
  {
    number: "01",
    icon: NotebookText,
    title: "Log your day",
    description: "Meals, workouts, water, sleep, weight — whatever you did, as it happens.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "Generate tonight's prompt",
    description: "One tap builds a prompt from everything you logged today.",
  },
  {
    number: "03",
    icon: Copy,
    title: "Paste into your own Claude",
    description: "Copy the prompt into a Claude chat you control. Your data only ever goes where you send it.",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Import your report",
    description: "Paste Claude's reply back in and get your scored, personalized coach report instantly.",
  },
] as const;

/** The frame every phone mockup on this page shares — status bar + rounded bezel — so the hero device and the three "in action" previews stay visually consistent without repeating the chrome markup. */
function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="rounded-[2rem] border-[3px] border-neutral-800 bg-black p-2 shadow-2xl shadow-black/40">
        <div className="overflow-hidden rounded-[1.6rem] bg-background">
          <div className="flex items-center justify-between px-4 pt-2.5 pb-1 text-[10px] font-semibold text-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1 text-foreground">
              <Signal className="size-3" />
              <Wifi className="size-3" />
              <Battery className="size-3.5" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <div className="flex flex-col gap-16 pt-2 pb-16">
      <WelcomeHeader />

      <section className="flex flex-col gap-6 pt-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
          <Sparkles className="size-3" />
          Your personal fitness OS
        </span>
        <h1 className="text-4xl font-black tracking-tight text-foreground text-balance">
          Log once. <span className="text-primary">Train smarter.</span>
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Track food, workouts, sleep, weight, and progress photos in one habit — then get a personalized nightly
          coach report built from your own data.
        </p>
        <div className="flex flex-col gap-3">
          <Button nativeButton={false} render={<Link href="/signup" />} size="lg">
            Create free account
            <span aria-hidden="true">→</span>
          </Button>
          <Button nativeButton={false} render={<Link href="#how-it-works" />} variant="outline" size="lg">
            See how it works
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Icon className="size-3.5 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Hero device — an illustrative mockup of the real Today dashboard, not a literal screenshot; the numbers shown are examples, not real user data. */}
      <PhoneFrame className="mx-auto w-full max-w-[280px]">
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[15px] font-bold text-foreground">
              Today
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
              <CheckCircle2 className="size-3.5" />
              Synced
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-3">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                <Flame className="size-3 text-warning" />
                Calories
              </span>
              <span className="text-lg font-bold text-foreground tabular-nums">1,742</span>
              <span className="text-[10px] font-semibold text-primary">-418 vs target</span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-3">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                <Dumbbell className="size-3 text-primary" />
                Workout
              </span>
              <span className="text-[15px] font-bold text-foreground">Pull day</span>
              <span className="text-[10px] text-muted-foreground">42 min logged</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-foreground">Protein</span>
              <span className="text-muted-foreground tabular-nums">112 / 130g</span>
              <span className="font-bold text-primary">86%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[86%] rounded-full bg-primary" />
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-3">
            <span className="flex items-center gap-1 text-[11px] font-bold text-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Nightly coach report
            </span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Protein goal hit &middot; Recovery looks good &middot; Increase lat pulldown by{" "}
              <span className="font-bold text-primary">2.5 kg</span> next week.
            </p>
          </div>

          <div className="mt-1 flex items-center justify-around border-t border-border pt-2.5 pb-1">
            {[
              { icon: NotebookText, label: "Home", active: true },
              { icon: NotebookText, label: "Journal" },
              { icon: Dumbbell, label: "Workouts" },
              { icon: TrendingUp, label: "Progress" },
              { icon: Sparkles, label: "Reports" },
            ].map(({ icon: Icon, label, active }) => (
              <span
                key={label}
                className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="size-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </PhoneFrame>

      <section id="features" className="flex flex-col gap-5">
        <h2 className="text-2xl font-black tracking-tight text-foreground">Everything you need</h2>
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

      <section id="how-it-works" className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">How your nightly report works</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Four simple steps, every night — and the one that matters most is entirely in your control.
          </p>
        </div>

        <div className="flex flex-col">
          {STEPS.map(({ number, icon: Icon, title, description }, index) => (
            <div key={number} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary tabular-nums">
                  {number}
                </span>
                {index < STEPS.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
              </div>
              <div className="flex gap-3 pb-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="pt-1">
                  <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </div>
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

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-black tracking-tight text-foreground">See Project Hulk in action</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PhoneFrame className="mx-auto w-full max-w-[220px]">
            <div className="flex flex-col gap-2.5 px-3 py-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                Nutrition
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-semibold text-primary">
                  Day
                </span>
              </div>
              <div className="mx-auto flex size-24 items-center justify-center rounded-full border-[6px] border-primary/25">
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold text-foreground tabular-nums">1,742</span>
                  <span className="text-[9px] text-muted-foreground">of 2,160 kcal</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {[
                  { label: "Protein", value: "112g" },
                  { label: "Carbs", value: "162g" },
                  { label: "Fat", value: "58g" },
                ].map((macro) => (
                  <div key={macro.label} className="rounded-lg bg-card p-1.5">
                    <p className="text-[10px] font-bold text-foreground">{macro.value}</p>
                    <p className="text-[8px] text-muted-foreground">{macro.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </PhoneFrame>

          <PhoneFrame className="mx-auto w-full max-w-[220px]">
            <div className="flex flex-col gap-2 px-3 py-2.5">
              <p className="text-[11px] font-bold text-foreground">Pull Day</p>
              {[
                { name: "Lat Pulldown", detail: "52.5kg · 4x10" },
                { name: "Seated Row", detail: "47.5kg · 4x10" },
                { name: "Face Pull", detail: "15kg · 3x15" },
              ].map((exercise) => (
                <div key={exercise.name} className="flex items-center justify-between rounded-lg bg-card px-2 py-1.5">
                  <span className="text-[10px] font-semibold text-foreground">{exercise.name}</span>
                  <span className="text-[9px] text-muted-foreground">{exercise.detail}</span>
                </div>
              ))}
              <span className="mt-0.5 flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-1.5 text-[9px] font-semibold text-muted-foreground">
                <Plus className="size-2.5" />
                Add Exercise
              </span>
            </div>
          </PhoneFrame>

          <PhoneFrame className="mx-auto w-full max-w-[220px]">
            <div className="flex flex-col gap-2 px-3 py-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                Progress
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-semibold text-primary">
                  Month
                </span>
              </div>
              <div>
                <p className="text-base font-bold text-foreground tabular-nums">65.6 kg</p>
                <p className="text-[10px] font-semibold text-primary">-1.8 kg this month</p>
              </div>
              <svg viewBox="0 0 100 30" className="h-8 w-full text-primary" preserveAspectRatio="none">
                <polyline
                  points="0,22 15,20 30,23 45,16 60,14 75,10 100,6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-lg bg-card p-1.5">
                  <p className="text-[10px] font-bold text-foreground">65.6 kg</p>
                  <p className="text-[8px] text-muted-foreground">Weight</p>
                </div>
                <div className="rounded-lg bg-card p-1.5">
                  <p className="text-[10px] font-bold text-foreground">24.1%</p>
                  <p className="text-[8px] text-muted-foreground">Body Fat</p>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-gradient-to-b from-primary/10 to-transparent p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Flame className="size-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Ready to become unstoppable?</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Free to use. Takes about two minutes to set up your profile.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/signup" />} size="lg" className="w-full sm:w-auto">
          Create your free account
          <span aria-hidden="true">→</span>
        </Button>
      </section>

      <footer className="flex flex-col gap-8 border-t border-border pt-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
            <span className="flex items-center gap-2 text-sm font-black tracking-tight text-foreground">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                PH
              </span>
              Project Hulk
            </span>
            <p className="text-xs text-muted-foreground">
              Built for people who&rsquo;d rather log once than think twice.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">Product</p>
            <a href="#features" className="text-xs text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-xs text-muted-foreground hover:text-foreground">
              How it works
            </a>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">Legal</p>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Project Hulk. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
