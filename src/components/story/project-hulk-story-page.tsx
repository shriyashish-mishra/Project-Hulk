"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bug,
  Clock,
  Cpu,
  Database,
  Gauge,
  Layers,
  MessageCircleWarning,
  Microscope,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  TrendingDown,
} from "lucide-react";
import { COLOR, CARD_BASE, inter } from "@/components/welcome/marketing-theme";

/* ---------------------------------------------------------------------- */
/* Header                                                                  */
/* ---------------------------------------------------------------------- */

function Header() {
  return (
    <header className="flex h-16 items-center justify-between px-5">
      <Link
        href="/welcome"
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: COLOR.textSecondary }}
      >
        <ArrowLeft className="size-4" />
        Project Hulk
      </Link>
      <Link
        href="/signup"
        className="rounded-full px-4 py-2 text-xs font-bold"
        style={{ backgroundColor: COLOR.mint, color: COLOR.bg }}
      >
        Create free account
      </Link>
    </header>
  );
}

/* ---------------------------------------------------------------------- */
/* Hero                                                                    */
/* ---------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="animate-fade-up flex flex-col gap-5 px-5 pt-6">
      <span
        className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] uppercase"
        style={{ borderColor: `${COLOR.mint}4D`, backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
      >
        <Sparkles className="size-3" />
        The story
      </span>
      <h1
        className="text-[38px] leading-[1.02] font-black tracking-tight text-balance"
        style={{ color: COLOR.textPrimary }}
      >
        I built a fitness app so I&rsquo;d stop lying to my spreadsheet.
      </h1>
      <p className="text-[15px] leading-7" style={{ color: COLOR.textSecondary }}>
        I&rsquo;m Shriyashish. Then I spent a very long weekend arguing with three different AI models about
        whether my calorie deficit was 600 or 130 &mdash; same day, same data. Here&rsquo;s that story, the
        decisions I&rsquo;d defend at a dinner party, and the stack it&rsquo;s built with.
      </p>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Section shell                                                           */
/* ---------------------------------------------------------------------- */

function StorySection({
  eyebrow,
  title,
  delay = "0ms",
  children,
}: {
  eyebrow: string;
  title: string;
  delay?: string;
  children: ReactNode;
}) {
  return (
    <section className="animate-fade-up flex flex-col gap-4 px-5 py-7" style={{ animationDelay: delay }}>
      <div className="flex flex-col gap-1.5">
        <span
          className="text-xs font-bold tracking-[0.14em] uppercase"
          style={{ color: COLOR.mint }}
        >
          {eyebrow}
        </span>
        <h2 className="text-2xl font-bold text-balance" style={{ color: COLOR.textPrimary }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Origin story                                                            */
/* ---------------------------------------------------------------------- */

function OriginSection() {
  return (
    <StorySection eyebrow="How this started" title="Log once, stop thinking about it" delay="60ms">
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        I was tired of opening four different apps to log a meal, a workout, my water, and my weight, then
        reconciling it all myself to see if the day actually went well. So I built one journal instead &mdash; plus
        a nightly coach report that started as the cheapest version of &ldquo;AI feedback&rdquo; I could ship: the
        app built a prompt, I pasted it into my own Claude, I brought the reply back. Zero cost, zero ambiguity
        about where my data went. It also meant four manual steps, every single night, between logging and
        actually having a report. Eventually that friction won.
      </p>
    </StorySection>
  );
}

/* ---------------------------------------------------------------------- */
/* The bake-off — the fun, war-story-heavy centerpiece                     */
/* ---------------------------------------------------------------------- */

interface WarStoryProps {
  icon: typeof Bug;
  title: string;
  body: string;
  stat?: { label: string; value: string; sub?: string };
}

function WarStoryCard({ icon: Icon, title, body, stat }: WarStoryProps) {
  return (
    <div className={CARD_BASE} style={{ backgroundColor: COLOR.cardElevated, borderColor: COLOR.border }}>
      <div className="flex items-start gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
        >
          <Icon className="size-4" />
        </span>
        <div className="flex-1">
          <h3 className="text-[15px] font-semibold" style={{ color: COLOR.textPrimary }}>
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6" style={{ color: COLOR.textSecondary }}>
            {body}
          </p>
        </div>
      </div>
      {stat && (
        <div
          className="mt-3 flex items-center justify-between rounded-2xl px-3.5 py-2.5"
          style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
        >
          <span className="text-xs font-medium" style={{ color: COLOR.textMuted }}>
            {stat.label}
          </span>
          <span className="text-right">
            <span className="text-sm font-bold tabular-nums" style={{ color: COLOR.mint }}>
              {stat.value}
            </span>
            {stat.sub && (
              <span className="ml-1.5 text-xs" style={{ color: COLOR.textMuted }}>
                {stat.sub}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

const WAR_STORIES: WarStoryProps[] = [
  {
    icon: MessageCircleWarning,
    title: "The AI thought I was superhuman",
    body: "First automated report: the free model scored my recovery 90/100 on a day I'd trained three times with one rest day. The old manual report for that exact day said 58. Somewhere in between is the gap between \"listen to your body\" and \"you're always fine, actually.\"",
    stat: { label: "Recovery score, same day", value: "58 → 90", sub: "not an improvement" },
  },
  {
    icon: Bug,
    title: "Resting was scored as failing",
    body: "A rest day scored a flat 0 for workout effort, like recovering was a crime. The old reports had scored deliberate rest days 90 and 100. The prompt just never said what to do with a day that had no workout at all.",
  },
  {
    icon: TrendingDown,
    title: "My calorie deficit had main-character energy",
    body: "Same nutrition log, three real runs, three deficits: -350, then -150, then -600. My goal deliberately never gets a calorie target, so every model was quietly inventing its own maintenance number from nothing. The fix: hand it my own recent history and tell it to stay consistent with itself.",
    stat: { label: "Deficit spread, same data", value: "450 kcal", sub: "of pure vibes" },
  },
  {
    icon: Timer,
    title: "I optimized the wrong thing first",
    body: "Reports were taking 30+ seconds, so I assumed the unused markdown report nobody reads was the bottleneck. Cut it. Response size dropped by half. Speed didn't move at all. The real fix was a lighter model, found only by timing things instead of guessing.",
    stat: { label: "Report generation time", value: "31s → 5s", sub: "after actually measuring" },
  },
] as const;

function BakeOffSection() {
  return (
    <StorySection
      eyebrow="The part with the bugs"
      title="I tried to remove four manual steps. Found new problems instead."
      delay="120ms"
    >
      <div className="flex flex-col gap-3">
        {WAR_STORIES.map((story) => (
          <WarStoryCard key={story.title} {...story} />
        ))}
      </div>
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        (There was more &mdash; a smarter model that kept getting rate-limited into silence, and workout data that
        was calculated correctly the whole time but never once rendered on screen.) Every fix here has the same
        shape: notice a number that looks wrong, pull the real data, run it again, only then change anything.
      </p>
    </StorySection>
  );
}

/* ---------------------------------------------------------------------- */
/* Decisions                                                               */
/* ---------------------------------------------------------------------- */

const DECISIONS = [
  {
    icon: ShieldCheck,
    title: "The manual path never goes away",
    body: "Automatic is the default now, but pasting into your own Claude is still one tap away on every report screen.",
  },
  {
    icon: Rocket,
    title: "Photos leave the app for no one, automatically",
    body: "Every other data point can flow into the report on its own. Progress photos never do. Not once.",
  },
  {
    icon: Sparkles,
    title: "One mint, used sparingly",
    body: "Near-black surfaces, one accent color. If a screen has more than one thing glowing, that's a bug.",
  },
  {
    icon: Microscope,
    title: "Nothing ships on vibes",
    body: "Every AI-facing fix here was verified against real logged data before it shipped. No before/after number, no ship.",
  },
] as const;

function DecisionsSection() {
  return (
    <StorySection eyebrow="Calls I'd defend" title="A few decisions I'm not walking back" delay="180ms">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DECISIONS.map(({ icon: Icon, title, body }) => (
          <div key={title} className={CARD_BASE} style={{ backgroundColor: COLOR.card, borderColor: "rgba(255,255,255,0.05)" }}>
            <span
              className="flex size-9 items-center justify-center rounded-full"
              style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
            >
              <Icon className="size-4" />
            </span>
            <h3 className="mt-3 text-[15px] font-semibold" style={{ color: COLOR.textPrimary }}>
              {title}
            </h3>
            <p className="mt-1 text-sm leading-6" style={{ color: COLOR.textSecondary }}>
              {body}
            </p>
          </div>
        ))}
      </div>
    </StorySection>
  );
}

/* ---------------------------------------------------------------------- */
/* Stack                                                                    */
/* ---------------------------------------------------------------------- */

const STACK_GROUPS = [
  {
    icon: Layers,
    label: "Frontend",
    items: ["Next.js 16 (App Router)", "React 19 + TypeScript", "Tailwind CSS v4", "Base UI + a custom shadcn-style kit"],
  },
  {
    icon: Database,
    label: "Backend & data",
    items: ["Supabase — Postgres, Auth, Storage, RLS on every table"],
  },
  {
    icon: Cpu,
    label: "AI",
    items: ["Gemini (gemini-3.5-flash-lite) for the nightly report", "Claude, manually, as the always-available fallback", "An MCP server so Claude.ai can log by chat"],
  },
  {
    icon: Gauge,
    label: "Infra",
    items: ["Vercel — hosting + Cron for the nightly run"],
  },
  {
    icon: Smartphone,
    label: "Mobile",
    items: ["A separate native app — Expo + React Native"],
  },
] as const;

function StackSection() {
  return (
    <StorySection eyebrow="What it's built with" title="The stack, honestly" delay="240ms">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {STACK_GROUPS.map(({ icon: Icon, label, items }) => (
          <div key={label} className={CARD_BASE} style={{ backgroundColor: COLOR.card, borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <Icon className="size-4" style={{ color: COLOR.mint }} />
              <span className="text-sm font-semibold" style={{ color: COLOR.textPrimary }}>
                {label}
              </span>
            </div>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6" style={{ color: COLOR.textSecondary }}>
                  <span className="mt-2 size-1 shrink-0 rounded-full" style={{ backgroundColor: COLOR.mint }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </StorySection>
  );
}

/* ---------------------------------------------------------------------- */
/* Closing CTA                                                             */
/* ---------------------------------------------------------------------- */

function ClosingSection() {
  return (
    <section className="px-5 py-6">
      <div
        className="animate-fade-up relative overflow-hidden rounded-3xl border p-6"
        style={{ borderColor: COLOR.border, backgroundColor: COLOR.card, animationDelay: "300ms" }}
      >
        <div
          className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full"
          style={{ background: `radial-gradient(circle, ${COLOR.mintGlow} 0%, transparent 70%)` }}
        />
        <div className="relative flex flex-col gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
          >
            <Clock className="size-5" />
          </span>
          <h2 className="text-2xl font-bold" style={{ color: COLOR.textPrimary }}>
            Still being built, in public commits.
          </h2>
          <p className="text-sm leading-6" style={{ color: COLOR.textSecondary }}>
            No roadmap deck, no launch date &mdash; just a personal tool getting measurably better one verified fix
            at a time.
          </p>
        </div>
        <div className="relative mt-6 flex flex-col gap-2">
          <Link
            href="/signup"
            className="flex h-14 items-center justify-center rounded-2xl text-base font-bold transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: COLOR.mint, color: COLOR.bg }}
          >
            Create free account
          </Link>
          <a
            href="https://shriyashish.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold"
            style={{ color: COLOR.textSecondary }}
          >
            Or see what else I&rsquo;ve built
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Footer                                                                   */
/* ---------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="flex flex-col gap-4 border-t px-5 py-8" style={{ borderColor: COLOR.border }}>
      <div className="flex flex-wrap gap-4">
        {[
          { href: "/welcome", label: "Home" },
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ].map((link) => (
          <Link key={link.label} href={link.href} className="text-xs" style={{ color: COLOR.textMuted }}>
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-xs" style={{ color: COLOR.textMuted }}>
        &copy; {new Date().getFullYear()} Project Hulk. Recovery score not actually 90.
      </p>
    </footer>
  );
}

/* ---------------------------------------------------------------------- */
/* Page                                                                     */
/* ---------------------------------------------------------------------- */

export function ProjectHulkStoryPage() {
  return (
    // Same full-bleed breakout as the welcome page — see that file for why.
    <div
      className={`relative left-1/2 min-h-screen w-screen -translate-x-1/2 -mt-8 -mb-28 ${inter.className}`}
      style={{ backgroundColor: COLOR.bg }}
    >
      <div className="mx-auto flex max-w-md flex-col md:max-w-2xl">
        <Header />
        <Hero />
        <OriginSection />
        <BakeOffSection />
        <DecisionsSection />
        <StackSection />
        <ClosingSection />
        <Footer />
      </div>
    </div>
  );
}
