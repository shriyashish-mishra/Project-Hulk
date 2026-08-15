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
  Stethoscope,
  Timer,
  TrendingDown,
  Zap,
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
        Then I spent a very long weekend arguing with three different AI models about whether my calorie deficit
        was 600 or 130 &mdash; same day, same data. This is that story, plus the tech stack, the decisions
        I&rsquo;d defend at a dinner party, and the bugs I&rsquo;m only slightly embarrassed by.
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
    <section className="animate-fade-up flex flex-col gap-4 px-5 py-8" style={{ animationDelay: delay }}>
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
/* Who's behind this                                                       */
/* ---------------------------------------------------------------------- */

const CREDS = [
  { icon: Stethoscope, label: "Meril Life Sciences", detail: "AI-native clinical workflows, now" },
  { icon: Sparkles, label: "Eka Care", detail: "CRM & growth — 60% more activated users" },
  { icon: Microscope, label: "Qure.ai", detail: "Radiology AI adoption, global Tier-1 markets" },
] as const;

function WhoSection() {
  return (
    <StorySection eyebrow="Who's behind this" title="I make hospitals trust AI. This is what I do to unwind." delay="60ms">
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        I&rsquo;m Shriyashish — a product manager who spends the day job at the intersection of healthcare and AI:
        clinical workflows, radiology adoption, the kind of products where &ldquo;the model is wrong&rdquo; has
        actual stakes. My whole approach fits on a sticky note: understand deeply, validate rigorously, execute
        relentlessly.
      </p>
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        Project Hulk is that same sticky note pointed at something much lower-stakes: whether I ate enough protein
        today. Turns out the habits transfer either way — you&rsquo;ll see exactly how far &ldquo;validate
        rigorously&rdquo; goes later in this page.
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {CREDS.map(({ icon: Icon, label, detail }) => (
          <div key={label} className={CARD_BASE} style={{ backgroundColor: COLOR.card, borderColor: "rgba(255,255,255,0.05)" }}>
            <Icon className="size-4" style={{ color: COLOR.mint }} />
            <p className="mt-2 text-sm font-semibold" style={{ color: COLOR.textPrimary }}>
              {label}
            </p>
            <p className="mt-0.5 text-xs leading-5" style={{ color: COLOR.textMuted }}>
              {detail}
            </p>
          </div>
        ))}
      </div>
    </StorySection>
  );
}

/* ---------------------------------------------------------------------- */
/* Origin story                                                            */
/* ---------------------------------------------------------------------- */

function OriginSection() {
  return (
    <StorySection eyebrow="How this started" title="Today's Journal: log once, stop thinking about it" delay="120ms">
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        The idea was never &ldquo;build a fitness app.&rdquo; It was narrower and pettier than that: I was tired of
        opening four different apps to log a meal, a workout, my water, and my weight, then mentally reconciling
        all of it myself to figure out if the day actually went well. So I built one journal. Log once, see the
        whole day.
      </p>
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        The nightly coach report started as the cheapest possible version of &ldquo;AI feedback&rdquo; I could ship:
        the app would build a prompt from your day&rsquo;s logs, and you&rsquo;d paste it into your own Claude
        conversation and bring the reply back. Zero API cost, zero infrastructure, and — this part mattered —
        zero ambiguity about where your data went, because you were the one sending it. A native mobile app
        (Expo, React Native) followed once the web version proved the loop actually worked day to day.
      </p>
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        It worked. It was also, every single night, four manual steps between &ldquo;I&rsquo;m done logging&rdquo;
        and &ldquo;I have my report.&rdquo; Eventually that friction won.
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
    body: "First real test of the automated report: the free model scored my recovery 90/100 on a day where I'd trained three times with one rest day. The already-saved report for that same day, written the old manual way, said 58. Somewhere between 58 and 90 is the difference between \"listen to your body\" and \"you are fine, actually, you are always fine.\"",
    stat: { label: "Recovery score, same day", value: "58 → 90", sub: "not an improvement" },
  },
  {
    icon: Bug,
    title: "Resting was scored as failing",
    body: "Then I found a rest day scored 0 for workout effort — a flat zero, like choosing to recover was a crime. Checked the history: the old manual reports had scored deliberate rest days 90 and 100, treating \"I chose not to train today\" as good training discipline. The instruction just never said what to do with a day that had no workout at all, so the model filled the silence with the least generous read available.",
  },
  {
    icon: TrendingDown,
    title: "My calorie deficit had main-character energy",
    body: "Same nutrition log, three separate real runs, three wildly different deficits: -350, then -150, then -600. Turns out my profile goal deliberately never gets a calorie target at all — by design, so it isn't reduced to a number — which means every model was quietly inventing its own maintenance calories from nothing. The fix wasn't a smarter model. It was handing it my own recent history and telling it, in no uncertain terms, to stay consistent with itself.",
    stat: { label: "Deficit spread, same data", value: "450 kcal", sub: "of pure vibes" },
  },
  {
    icon: Zap,
    title: "A smarter model that couldn't finish a sentence",
    body: "Tried a bigger free model for better reasoning. It was better — it anchored its own math to real numbers already sitting in the prompt, unprompted, the same instinct I later had to build in by hand for everyone else. It also has a per-minute token budget smaller than one full response, so it got rate-limited or truncated on 3 out of 3 real attempts. Best answer I never fully received.",
  },
  {
    icon: Timer,
    title: "I optimized the wrong thing first",
    body: "Report generation was taking 30+ seconds, so I assumed the unused markdown report — the pretty version nobody reads, since only the JSON gets parsed — was the bottleneck. Cut it. Response size dropped by more than half. Generation time didn't move by a single second. The actual fix was a lighter model, which I only found by timing things instead of guessing at them.",
    stat: { label: "Report generation time", value: "31s → 5s", sub: "after actually measuring" },
  },
  {
    icon: Database,
    title: "The data was right. The screen just never showed it",
    body: "Went looking for why calories burned wasn't showing up and found the AI had been calculating it correctly the entire time — duration, per-exercise burn, even step counts — and the report page had just never displayed five of the fields it was already computing. Nothing was broken. Nobody had ever looked.",
  },
];

function BakeOffSection() {
  return (
    <StorySection
      eyebrow="The part with the bugs"
      title="I tried to remove four manual steps. I found six new problems instead."
      delay="180ms"
    >
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        Automating the report meant picking an AI that could run unattended, for free, every night, without me
        babysitting it. That sounded like a one-afternoon decision. It was not. Here&rsquo;s what actually
        happened, in the order it happened, because the order is the whole point — every fix here came from
        catching the model doing something wrong on real data, not from assuming it might.
      </p>
      <div className="flex flex-col gap-3">
        {WAR_STORIES.map((story) => (
          <WarStoryCard key={story.title} {...story} />
        ))}
      </div>
      <p className="text-sm leading-7" style={{ color: COLOR.textSecondary }}>
        None of this shipped on a hunch. Every single fix above has the same shape: notice a number that looks
        wrong, pull the real data, run it again for real, compare, only then change the prompt. It&rsquo;s slower
        than trusting the first plausible-sounding answer. It also means I&rsquo;m not shipping a coach that
        confidently tells you you&rsquo;re recovered when you&rsquo;re not.
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
    body: "Automatic generation is the default now, but the original copy-a-prompt-into-your-own-Claude flow is still one tap away on every report screen. If the automatic run ever fails, or you just want Claude's full reasoning instead of a faster model's, it's still there.",
  },
  {
    icon: Rocket,
    title: "Photos leave the app for no one, automatically",
    body: "Every other data point can flow into the nightly report on its own. Progress photos never do. If I want AI feedback on a photo, I attach it myself, in my own conversation, every time. It's the one rule in this whole project I never once considered relaxing for convenience.",
  },
  {
    icon: Sparkles,
    title: "One mint, used sparingly",
    body: "Near-black surfaces, a single accent color, no gradients standing in for good decisions. If a screen has more than one thing glowing, that's not a design choice, that's a bug.",
  },
  {
    icon: Microscope,
    title: "Nothing ships on vibes",
    body: "Every AI-facing fix in this project was verified against real logged data before it shipped — dry runs against actual meals and workouts, never synthetic examples. If I can't point at a before/after number, it doesn't count as fixed.",
  },
] as const;

function DecisionsSection() {
  return (
    <StorySection eyebrow="Calls I'd defend" title="A few decisions I'm not walking back" delay="240ms">
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
    items: ["Next.js 16 (App Router)", "React 19 + TypeScript", "Tailwind CSS v4", "Base UI + a custom shadcn-style kit", "Recharts"],
  },
  {
    icon: Database,
    label: "Backend & data",
    items: ["Supabase — Postgres, Auth, Storage", "Row-level security on every table", "Separate dev / stable projects"],
  },
  {
    icon: Cpu,
    label: "AI",
    items: ["Gemini (gemini-3.5-flash-lite) for the nightly report", "Claude, manually, as the always-available fallback", "An MCP server so Claude.ai itself can log meals & workouts by chat"],
  },
  {
    icon: Gauge,
    label: "Infra",
    items: ["Vercel — hosting + Cron for the nightly run", "A Todoist webhook bridge for quick capture on the go"],
  },
  {
    icon: Smartphone,
    label: "Mobile",
    items: ["A separate native app — Expo + React Native"],
  },
] as const;

function StackSection() {
  return (
    <StorySection eyebrow="What it's built with" title="The stack, honestly" delay="300ms">
      <div className="flex flex-col gap-3">
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
        style={{ borderColor: COLOR.border, backgroundColor: COLOR.card, animationDelay: "360ms" }}
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
            Still being built, on the record, in public commits.
          </h2>
          <p className="text-sm leading-6" style={{ color: COLOR.textSecondary }}>
            No roadmap deck, no launch date — just a personal tool getting measurably better one verified fix at a
            time. If that sounds like your kind of project, come log a day.
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
        <WhoSection />
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
