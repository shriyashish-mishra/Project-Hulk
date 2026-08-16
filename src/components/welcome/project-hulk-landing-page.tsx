"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Battery,
  BookOpen,
  Bookmark,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Flame,
  Lock,
  Menu,
  NotebookText,
  ShieldCheck,
  Signal,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wifi,
  X,
} from "lucide-react";
import { COLOR, CARD_BASE, inter } from "./marketing-theme";

/* ---------------------------------------------------------------------- */
/* Header                                                                  */
/* ---------------------------------------------------------------------- */

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <header className="flex h-16 items-center justify-between px-5">
        <span className="flex items-center gap-2 text-base font-bold tracking-tight" style={{ color: COLOR.textPrimary }}>
          <span
            className="flex size-8 items-center justify-center rounded-full text-xs font-black"
            style={{ backgroundColor: COLOR.mint, color: COLOR.bg }}
          >
            PH
          </span>
          Project Hulk
        </span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold" style={{ color: COLOR.textSecondary }}>
            Log in
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex size-9 items-center justify-center rounded-full active:opacity-60"
            style={{ color: COLOR.textPrimary }}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="absolute inset-x-5 top-full z-20 mt-1 flex flex-col gap-1 rounded-2xl border p-2 shadow-2xl"
          style={{ backgroundColor: COLOR.cardElevated, borderColor: COLOR.border }}
        >
          {[
            { href: "#features", label: "Features" },
            { href: "#insights", label: "Insights" },
            { href: "#how-it-works", label: "How it works" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold active:bg-white/5"
              style={{ color: COLOR.textPrimary }}
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/story"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold active:bg-white/5"
            style={{ color: COLOR.textPrimary }}
          >
            The story behind it
          </Link>
          <div className="my-1 border-t" style={{ borderColor: COLOR.border }} />
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-3 py-2.5 text-center text-sm font-bold"
            style={{ backgroundColor: COLOR.mint, color: COLOR.bg }}
          >
            Create free account
          </Link>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Hero                                                                    */
/* ---------------------------------------------------------------------- */

const TRUST_BADGES = [
  { icon: Lock, label: "100% private" },
  { icon: Clock, label: "2-minute setup" },
  { icon: Smartphone, label: "Built for mobile" },
] as const;

function Hero() {
  return (
    <section className="flex flex-col gap-6 px-5 pt-8 md:grid md:grid-cols-2 md:items-center md:gap-12 md:pt-16">
      <div className="flex flex-col gap-6">
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] uppercase"
          style={{ borderColor: `${COLOR.mint}4D`, backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
        >
          <Sparkles className="size-3" />
          Your personal fitness OS
        </span>

        <h1
          className="text-[44px] leading-[0.95] font-black tracking-tight text-balance"
          style={{ color: COLOR.textPrimary }}
        >
          Log once.
          <br />
          <span style={{ color: COLOR.mint }}>Train smarter.</span>
        </h1>

        <p className="text-sm leading-6" style={{ color: COLOR.textSecondary }}>
          Track food, workouts, sleep, weight, and progress photos in one habit — then get a personalized nightly
          coach report built from your own data.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="flex h-14 items-center justify-center rounded-2xl text-base font-bold transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: COLOR.mint, color: COLOR.bg }}
          >
            Create free account
          </Link>
          <a
            href="#how-it-works"
            className="flex h-14 items-center justify-center rounded-2xl border text-base font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{ borderColor: "rgba(255,255,255,0.16)", color: COLOR.textPrimary, backgroundColor: "transparent" }}
          >
            See how it works
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: COLOR.border, backgroundColor: COLOR.card, color: COLOR.textSecondary }}
            >
              <Icon className="size-3.5" style={{ color: COLOR.mint }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <HeroPhoneMockup />
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Phone frame + hero mockup                                               */
/* ---------------------------------------------------------------------- */

function PhoneFrame({ children, width = 280 }: { children: ReactNode; width?: number }) {
  return (
    <div
      className="mx-auto shrink-0"
      style={{ width, filter: `drop-shadow(0 0 40px ${COLOR.mintGlow})` }}
    >
      <div
        className="rounded-[44px] p-2.5"
        style={{
          background: "linear-gradient(160deg, #3a3a3d 0%, #18181b 45%, #050505 100%)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        }}
      >
        <div className="overflow-hidden rounded-[36px]" style={{ backgroundColor: COLOR.bg }}>
          {/* Notch */}
          <div className="relative flex justify-center">
            <div className="absolute top-0 h-5 w-28 rounded-b-2xl bg-black" />
          </div>
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold" style={{ color: COLOR.textPrimary }}>
            <span>9:41</span>
            <div className="flex items-center gap-1">
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

function HeroPhoneMockup() {
  return (
    <PhoneFrame width={300}>
      <div className="flex flex-col gap-3 px-4 pt-2 pb-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[15px] font-bold" style={{ color: COLOR.textPrimary }}>
            Today
            <ChevronDown className="size-3.5" style={{ color: COLOR.textMuted }} />
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: COLOR.mint }}>
            <CheckCircle2 className="size-3.5" />
            Synced
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1 rounded-2xl border p-3" style={{ backgroundColor: COLOR.card, borderColor: COLOR.border }}>
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: COLOR.textMuted }}>
              <Flame className="size-3" style={{ color: "#f0b135" }} />
              Calories
            </span>
            <span className="text-lg font-bold tabular-nums" style={{ color: COLOR.textPrimary }}>
              1,742
            </span>
            <span className="text-[10px] font-semibold" style={{ color: COLOR.mint }}>
              -418 vs target
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border p-3" style={{ backgroundColor: COLOR.card, borderColor: COLOR.border }}>
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: COLOR.textMuted }}>
              <Dumbbell className="size-3" style={{ color: COLOR.mint }} />
              Workout
            </span>
            <span className="text-[15px] font-bold" style={{ color: COLOR.textPrimary }}>
              Pull day
            </span>
            <span className="text-[10px]" style={{ color: COLOR.textMuted }}>
              42 min logged
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-2xl border p-3" style={{ backgroundColor: COLOR.card, borderColor: COLOR.border }}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold" style={{ color: COLOR.textPrimary }}>
              Protein
            </span>
            <span className="tabular-nums" style={{ color: COLOR.textMuted }}>
              112 / 130g
            </span>
            <span className="font-bold" style={{ color: COLOR.mint }}>
              86%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            <div className="h-full w-[86%] rounded-full" style={{ backgroundColor: COLOR.mint }} />
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-2xl border p-3" style={{ backgroundColor: COLOR.card, borderColor: COLOR.border }}>
          <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: COLOR.textPrimary }}>
            <Sparkles className="size-3.5" style={{ color: COLOR.mint }} />
            Nightly coach report
          </span>
          <p className="text-[11px] leading-relaxed" style={{ color: COLOR.textSecondary }}>
            Protein goal hit &middot; Recovery looks good &middot; Increase lat pulldown by{" "}
            <span className="font-bold" style={{ color: COLOR.mint }}>
              2.5 kg
            </span>{" "}
            next week.
          </p>
        </div>

        <div className="mt-1 flex items-center justify-around border-t pt-2.5" style={{ borderColor: COLOR.border }}>
          {[
            { icon: NotebookText, label: "Home", active: true },
            { icon: Dumbbell, label: "Workouts" },
            { icon: TrendingUp, label: "Progress" },
            { icon: Sparkles, label: "Reports" },
          ].map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className="flex flex-col items-center gap-0.5 text-[9px] font-semibold"
              style={{ color: active ? COLOR.mint : COLOR.textMuted }}
            >
              <Icon className="size-3.5" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

/* ---------------------------------------------------------------------- */
/* Everything you need                                                     */
/* ---------------------------------------------------------------------- */

const FEATURES = [
  { icon: NotebookText, title: "Daily Journal", description: "Log food, water, sleep, weight, cycle & more in seconds." },
  { icon: Dumbbell, title: "Workouts", description: "Reusable templates, live sessions & smart progression." },
  { icon: TrendingUp, title: "Progress Insights", description: "Daily, weekly & monthly trends with coach-style commentary." },
  { icon: Sparkles, title: "Coach Reports", description: "Personalized nightly report scored & summarized for you." },
  { icon: Bookmark, title: "Saved Presets", description: "Meals & workouts saved once, log again in one tap." },
  { icon: Camera, title: "Progress Photos", description: "Track front, side & back photos, private to your account." },
] as const;

function FeatureCard({ icon: Icon, title, description }: { icon: typeof NotebookText; title: string; description: string }) {
  return (
    <div
      className={CARD_BASE}
      style={{ backgroundColor: COLOR.card, borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
        >
          <Icon className="size-5" />
        </span>
        <ChevronRight className="size-4 shrink-0" style={{ color: COLOR.textMuted }} />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold" style={{ color: COLOR.textPrimary }}>
        {title}
      </h3>
      <p className="mt-1 text-sm leading-6" style={{ color: COLOR.textSecondary }}>
        {description}
      </p>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="flex flex-col gap-5 px-5 py-6">
      <h2 className="text-2xl font-bold" style={{ color: COLOR.textPrimary }}>
        Everything you need
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Insights carousel                                                       */
/* ---------------------------------------------------------------------- */

function InsightShell({ title, icon: Icon, children }: { title: string; icon: typeof Flame; children: ReactNode }) {
  return (
    <div
      className={`${CARD_BASE} flex w-[220px] shrink-0 snap-center flex-col gap-3`}
      style={{ backgroundColor: COLOR.cardElevated, borderColor: COLOR.border }}
    >
      <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase" style={{ color: COLOR.mint }}>
        <Icon className="size-3.5" />
        {title}
      </span>
      {children}
    </div>
  );
}

function MiniBar({ height, active }: { height: number; active?: boolean }) {
  return (
    <div className="flex h-10 w-3 items-end rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
      <div
        className="w-full rounded-full"
        style={{ height: `${height}%`, backgroundColor: active ? COLOR.mint : "rgba(255,255,255,0.22)" }}
      />
    </div>
  );
}

function CalorieBalanceCard() {
  const days = [
    { label: "M", height: 70, active: true },
    { label: "T", height: 30 },
    { label: "W", height: 95, active: true },
    { label: "T", height: 20 },
    { label: "F", height: 55 },
    { label: "S", height: 15 },
    { label: "S", height: 40 },
  ];
  return (
    <InsightShell title="Calorie Balance" icon={Flame}>
      <div>
        <p className="text-[10px] font-medium" style={{ color: COLOR.textMuted }}>
          Avg Daily Deficit
        </p>
        <p className="text-xl font-black tabular-nums" style={{ color: COLOR.textPrimary }}>
          710 <span className="text-xs font-medium" style={{ color: COLOR.textMuted }}>kcal/day</span>
        </p>
      </div>
      <div className="flex items-end justify-between gap-1">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <MiniBar height={day.height} active={day.active} />
            <span className="text-[8px] font-medium" style={{ color: COLOR.textMuted }}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 border-t pt-2" style={{ borderColor: COLOR.border }}>
        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: COLOR.textMuted }}>Total Deficit</span>
          <span className="font-bold" style={{ color: COLOR.textPrimary }}>
            2,130 kcal
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: COLOR.textMuted }}>Est. Fat Loss</span>
          <span className="font-bold" style={{ color: COLOR.textPrimary }}>
            0.28 kg
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: COLOR.textMuted }}>Best Day</span>
          <span className="font-bold" style={{ color: COLOR.mint }}>
            Wed &minus;810
          </span>
        </div>
      </div>
    </InsightShell>
  );
}

function BodySilhouette({ highlight }: { highlight: "shoulders" }) {
  return (
    <svg viewBox="0 0 40 80" className="h-16 w-8">
      <circle cx="20" cy="8" r="6" fill="rgba(255,255,255,0.18)" />
      <rect
        x="8"
        y="16"
        width="24"
        height="10"
        rx="4"
        fill={highlight === "shoulders" ? COLOR.mint : "rgba(255,255,255,0.18)"}
      />
      <rect x="11" y="25" width="18" height="24" rx="6" fill="rgba(255,255,255,0.12)" />
      <rect x="12" y="49" width="7" height="26" rx="3" fill="rgba(255,255,255,0.14)" />
      <rect x="21" y="49" width="7" height="26" rx="3" fill="rgba(255,255,255,0.14)" />
    </svg>
  );
}

function MuscleBalanceCard() {
  const groups = [
    { label: "Shoulders", value: 90, active: true },
    { label: "Back", value: 65 },
    { label: "Chest", value: 55 },
    { label: "Legs", value: 40 },
    { label: "Arms", value: 35 },
  ];
  return (
    <InsightShell title="Muscle Balance" icon={Dumbbell}>
      <div className="flex items-center justify-center gap-4">
        <BodySilhouette highlight="shoulders" />
        <BodySilhouette highlight="shoulders" />
      </div>
      <div className="flex flex-col gap-1.5">
        {groups.map((group) => (
          <div key={group.label} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-[9px] font-medium" style={{ color: COLOR.textMuted }}>
              {group.label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${group.value}%`, backgroundColor: group.active ? COLOR.mint : "rgba(255,255,255,0.3)" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-semibold"
        style={{ borderColor: `${COLOR.mint}33`, backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
      >
        <CheckCircle2 className="size-3" />
        Recovery Balance: Well balanced
      </div>
    </InsightShell>
  );
}

function MonthlyHighlightsCard() {
  const stats = [
    { label: "Avg score", value: "76" },
    { label: "Workouts", value: "21" },
    { label: "Avg protein", value: "124.2g" },
    { label: "Avg calories", value: "1922.3" },
    { label: "Consistency", value: "71%" },
    { label: "Longest streak", value: "11 days" },
  ];
  return (
    <InsightShell title="Monthly Highlights" icon={TrendingUp}>
      <p className="text-[11px] font-semibold" style={{ color: COLOR.textMuted }}>
        July 2026
      </p>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl p-2" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
            <p className="text-sm font-bold tabular-nums" style={{ color: COLOR.textPrimary }}>
              {stat.value}
            </p>
            <p className="text-[8.5px] leading-tight" style={{ color: COLOR.textMuted }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </InsightShell>
  );
}

function WorkoutProgressionCard() {
  return (
    <InsightShell title="Workout Progression" icon={Sparkles}>
      <div className="flex gap-1.5 overflow-x-auto">
        {["Tricep Pushdown", "Bicep Curls", "Lat Pulldown"].map((name, index) => (
          <span
            key={name}
            className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold whitespace-nowrap"
            style={
              index === 0
                ? { backgroundColor: COLOR.mint, color: COLOR.bg }
                : { backgroundColor: "rgba(255,255,255,0.06)", color: COLOR.textMuted }
            }
          >
            {name}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 100 30" className="h-8 w-full" preserveAspectRatio="none">
        <polyline
          points="0,20 20,18 40,18 60,12 80,12 100,12"
          fill="none"
          stroke={COLOR.mint}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-2" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
          <p className="text-sm font-bold tabular-nums" style={{ color: COLOR.textPrimary }}>
            10 lbs
          </p>
          <p className="text-[8.5px]" style={{ color: COLOR.textMuted }}>
            Current Weight
          </p>
        </div>
        <div className="rounded-xl p-2" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
          <p className="text-sm font-bold tabular-nums" style={{ color: COLOR.textPrimary }}>
            10 lbs
          </p>
          <p className="text-[8.5px]" style={{ color: COLOR.textMuted }}>
            Best Weight
          </p>
        </div>
      </div>
      <p className="text-[10px]" style={{ color: COLOR.textMuted }}>
        Last Session: <span style={{ color: COLOR.textPrimary }}>10lbs &times; 12 &times; 4 sets</span>
      </p>
      <div className="flex items-center justify-between gap-2 border-t pt-2" style={{ borderColor: COLOR.border }}>
        <span className="text-[11px] font-bold" style={{ color: COLOR.textPrimary }}>
          Stay at 10lbs
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[8.5px] font-semibold"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", color: COLOR.textSecondary }}
        >
          Medium confidence
        </span>
      </div>
    </InsightShell>
  );
}

function InsightsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardCount = 4;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / cardCount;
    setActiveIndex(Math.round(el.scrollLeft / cardWidth));
  }

  return (
    <section id="insights" className="flex flex-col gap-5 py-6">
      <div className="px-5">
        <h2 className="text-2xl font-bold" style={{ color: COLOR.textPrimary }}>
          Powerful insights.
          <br />
          Simple to understand.
        </h2>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <CalorieBalanceCard />
        <MuscleBalanceCard />
        <MonthlyHighlightsCard />
        <WorkoutProgressionCard />
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: cardCount }, (_, index) => (
          <span
            key={index}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: index === activeIndex ? 18 : 6,
              backgroundColor: index === activeIndex ? COLOR.mint : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* How it works timeline                                                   */
/* ---------------------------------------------------------------------- */

const STEPS = [
  {
    number: "01",
    icon: NotebookText,
    title: "Log your day",
    description: "Meals, workouts, water, sleep, weight — whatever you did.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Get a coach report — automatically",
    description: "Every night, or tap Generate any time. Scored and broken down in seconds.",
  },
  {
    number: "03",
    icon: Copy,
    title: "Want full control? Use your own AI",
    description: "Generate a prompt instead, paste it into your own conversation, import the reply — always there as a fallback.",
  },
] as const;

function TimelineStep({
  number,
  icon: Icon,
  title,
  description,
  isLast,
}: {
  number: string;
  icon: typeof NotebookText;
  title: string;
  description: string;
  isLast: boolean;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center gap-3 text-center">
      {!isLast && (
        <span
          className="absolute top-4 left-1/2 hidden h-px w-full sm:block"
          style={{ backgroundColor: COLOR.border }}
        />
      )}
      <span
        className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-black tabular-nums"
        style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
      >
        {number}
      </span>
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-2xl border"
        style={{ backgroundColor: COLOR.card, borderColor: COLOR.border, color: COLOR.textPrimary }}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <h3 className="text-[15px] font-semibold" style={{ color: COLOR.textPrimary }}>
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6" style={{ color: COLOR.textSecondary }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="flex flex-col gap-8 px-5 py-6">
      <h2 className="text-2xl font-bold" style={{ color: COLOR.textPrimary }}>
        How your nightly report works
      </h2>
      <div className="flex flex-col gap-8 sm:flex-row sm:gap-4">
        {STEPS.map((step, index) => (
          <TimelineStep key={step.number} {...step} isLast={index === STEPS.length - 1} />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Privacy + final CTA                                                     */
/* ---------------------------------------------------------------------- */

function PrivacyCtaSection() {
  return (
    <section className="px-5 py-6">
      <div
        className="relative overflow-hidden rounded-3xl border p-6 md:grid md:grid-cols-2 md:items-center md:gap-8"
        style={{ borderColor: COLOR.border, backgroundColor: COLOR.card }}
      >
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full"
          style={{ background: `radial-gradient(circle, ${COLOR.mintGlow} 0%, transparent 70%)` }}
        />
        <div className="relative flex flex-col gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
          >
            <ShieldCheck className="size-5" />
          </span>
          <h2 className="text-2xl font-bold" style={{ color: COLOR.textPrimary }}>
            You always know where your data goes.
          </h2>
          <p className="text-sm leading-6" style={{ color: COLOR.textSecondary }}>
            Your nightly report is generated by Google&rsquo;s Gemini — that&rsquo;s what makes it automatic.
            Progress photos are the one exception: never sent anywhere on their own. Prefer more control? Skip the
            automatic run and paste your own prompt into whichever AI you trust instead — I use Claude, but that
            call is yours.
          </p>
        </div>
        <div className="relative mt-6 flex flex-col gap-2 md:mt-0">
          <Link
            href="/signup"
            className="flex h-14 items-center justify-center rounded-2xl text-base font-bold transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: COLOR.mint, color: COLOR.bg }}
          >
            Create free account
          </Link>
          <p className="text-center text-xs" style={{ color: COLOR.textMuted }}>
            Free to use. Takes about 2 minutes to set up your profile.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* About the author                                                        */
/* ---------------------------------------------------------------------- */

function AboutAuthorSection() {
  return (
    <section className="px-5 py-6">
      <div className={CARD_BASE} style={{ backgroundColor: COLOR.card, borderColor: COLOR.border }}>
        <div className="flex items-center gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-black"
            style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
          >
            SM
          </span>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: COLOR.textPrimary }}>
              Built by Shriyashish Mishra
            </p>
            <p className="text-xs" style={{ color: COLOR.textMuted }}>
              Product Manager
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6" style={{ color: COLOR.textSecondary }}>
          Building products through strategy, experimentation, execution, and AI &mdash; Project Hulk is one of
          them. It also happens to be the one where I argue with a language model about leg day.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/story"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: COLOR.mint }}
          >
            Read the full story
            <BookOpen className="size-3.5" />
          </Link>
          <a
            href="https://shriyashish.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: COLOR.textSecondary }}
          >
            View full profile
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
    <footer className="flex flex-col gap-6 border-t px-5 py-8" style={{ borderColor: COLOR.border }}>
      <span className="flex items-center gap-2 text-sm font-bold" style={{ color: COLOR.textPrimary }}>
        <span
          className="flex size-6 items-center justify-center rounded-full text-[10px] font-black"
          style={{ backgroundColor: COLOR.mint, color: COLOR.bg }}
        >
          PH
        </span>
        Project Hulk
      </span>
      <p className="text-xs" style={{ color: COLOR.textMuted }}>
        Built for people who&rsquo;d rather log once than think twice.
      </p>
      <div className="flex flex-wrap gap-4">
        {[
          { href: "#features", label: "Features" },
          { href: "#how-it-works", label: "How it works" },
          { href: "/story", label: "The story" },
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ].map((link) => (
          <a key={link.label} href={link.href} className="text-xs" style={{ color: COLOR.textMuted }}>
            {link.label}
          </a>
        ))}
      </div>
      <p className="text-xs" style={{ color: COLOR.textMuted }}>
        &copy; {new Date().getFullYear()} Project Hulk
      </p>
    </footer>
  );
}

/* ---------------------------------------------------------------------- */
/* Page                                                                     */
/* ---------------------------------------------------------------------- */

export function ProjectHulkLandingPage() {
  return (
    // The shared root layout wraps every page in a `max-w-md px-5 pt-8
    // pb-28` <main>, which every other (mobile-app-shaped) screen relies
    // on — but this landing page needs to be genuinely full-bleed with
    // its own responsive breakpoints, so it breaks out of that
    // constraint via the standard viewport-relative centering trick
    // (`left-1/2` + `-translate-x-1/2` on a `w-screen` element ignores
    // the parent's own width) and cancels the inherited padding with
    // matching negative margins.
    <div
      className={`relative left-1/2 min-h-screen w-screen -translate-x-1/2 -mt-8 -mb-28 ${inter.className}`}
      style={{ backgroundColor: COLOR.bg }}
    >
      <div className="mx-auto flex max-w-md flex-col md:max-w-4xl">
        <Header />
        <Hero />
        <FeaturesSection />
        <InsightsSection />
        <HowItWorksSection />
        <PrivacyCtaSection />
        <AboutAuthorSection />
        <Footer />
      </div>
    </div>
  );
}
