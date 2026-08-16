"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Dumbbell,
  Footprints,
  Moon,
  Scale,
  Utensils,
  Wand2,
  XCircle,
} from "lucide-react";
import { COLOR, inter } from "@/components/welcome/marketing-theme";

/* ---------------------------------------------------------------------- */
/* Scroll-reveal primitives — no animation library; a plain               */
/* IntersectionObserver hook is enough for a page this size, and keeps    */
/* the marketing bundle free of a new dependency.                        */
/* ---------------------------------------------------------------------- */

function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 700ms var(--ease-out-expo) ${delay}ms, transform 700ms var(--ease-out-expo) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/** Subtle scroll-linked drift for background glows — deliberately small (0.15-0.25x) so it reads as depth, not a slide show. */
function useParallax(speed: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (ref.current) ref.current.style.transform = `translateY(${window.scrollY * speed}px)`;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);
  return ref;
}

/* ---------------------------------------------------------------------- */
/* Header                                                                  */
/* ---------------------------------------------------------------------- */

function Header() {
  return (
    <header className="flex h-16 items-center px-5">
      <Link
        href="/welcome"
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: COLOR.textSecondary }}
      >
        <ArrowLeft className="size-4" />
        Project Hulk
      </Link>
    </header>
  );
}

/* ---------------------------------------------------------------------- */
/* 1. Hero                                                                 */
/* ---------------------------------------------------------------------- */

function Hero() {
  const glowRef = useParallax(0.15);
  return (
    <section className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden px-5">
      <div
        ref={glowRef}
        className="pointer-events-none absolute top-[-20%] left-1/2 size-[520px] -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${COLOR.mintGlow} 0%, transparent 70%)` }}
      />
      <div className="animate-fade-up relative flex flex-col gap-6">
        <span
          className="text-xs font-bold tracking-[0.32em] uppercase"
          style={{ color: COLOR.textMuted }}
        >
          Project Hulk
        </span>
        <h1
          className="text-[15vw] leading-[0.98] font-black tracking-tight text-balance sm:text-[64px]"
          style={{ color: COLOR.textPrimary }}
        >
          I didn&rsquo;t set out to build a fitness app.
        </h1>
        <p className="max-w-md text-lg leading-relaxed" style={{ color: COLOR.textSecondary }}>
          I had my health data. I just didn&rsquo;t understand it.
          <br />
          So I built something that could.
        </p>
        <p className="text-lg font-semibold" style={{ color: COLOR.mint }}>
          Becoming Hulk one day at a time.
        </p>
      </div>
      <div
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-1"
        style={{ color: COLOR.textMuted }}
      >
        <ChevronDown className="size-5" />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Section shell — deliberately not a card: most of this page is          */
/* typography directly on black, per the brief's "avoid rounded cards     */
/* everywhere."                                                           */
/* ---------------------------------------------------------------------- */

function Section({
  eyebrow,
  children,
  className,
}: {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-6 px-5 py-20 ${className ?? ""}`}>
      {eyebrow && (
        <Reveal>
          <span className="text-xs font-bold tracking-[0.28em] uppercase" style={{ color: COLOR.mint }}>
            {eyebrow}
          </span>
        </Reveal>
      )}
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* 2. The Problem                                                          */
/* ---------------------------------------------------------------------- */

const SCATTERED = [
  { icon: Utensils, label: "Food", rotate: -6 },
  { icon: Dumbbell, label: "Workouts", rotate: 4 },
  { icon: Scale, label: "Weight", rotate: -3 },
  { icon: Footprints, label: "Steps", rotate: 7 },
  { icon: Moon, label: "Sleep", rotate: -8 },
  { icon: Wand2, label: "AI", rotate: 5 },
] as const;

function ProblemSection() {
  return (
    <Section eyebrow="The problem">
      <div className="flex flex-wrap gap-3">
        {SCATTERED.map(({ icon: Icon, label, rotate }, index) => (
          <Reveal key={label} delay={index * 60}>
            <div
              className="flex items-center gap-2 rounded-2xl border px-4 py-3"
              style={{
                borderColor: COLOR.border,
                backgroundColor: COLOR.card,
                transform: `rotate(${rotate}deg)`,
              }}
            >
              <Icon className="size-4" style={{ color: COLOR.textMuted }} />
              <span className="text-sm font-medium" style={{ color: COLOR.textSecondary }}>
                {label}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={200}>
        <h2
          className="mt-2 text-[40px] leading-[1.02] font-black tracking-tight text-balance sm:text-6xl"
          style={{ color: COLOR.textPrimary }}
        >
          Too much data.
          <br />
          No context.
        </h2>
      </Reveal>
      <Reveal delay={260}>
        <p className="text-base" style={{ color: COLOR.textSecondary }}>
          Everything was tracked. Nothing connected.
        </p>
      </Reveal>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */
/* Mini "screenshot" recreations — no real image assets exist for this    */
/* app yet, so each stage gets a small, accurate recreation of its real   */
/* UI instead of a placeholder box.                                       */
/* ---------------------------------------------------------------------- */

function MockFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex w-full max-w-[220px] flex-col gap-2.5 rounded-[22px] border p-3.5"
      style={{ borderColor: COLOR.border, backgroundColor: "#050505" }}
    >
      {children}
    </div>
  );
}

function MockIdea() {
  return (
    <MockFrame>
      <div
        className="flex flex-col gap-2 rounded-xl border border-dashed p-3"
        style={{ borderColor: "rgba(255,255,255,0.15)" }}
      >
        <span className="text-[11px]" style={{ color: COLOR.textMuted }}>
          notes.txt
        </span>
        <p className="text-xs leading-5" style={{ color: COLOR.textSecondary }}>
          log food. log workout. see if the day actually went well?
        </p>
      </div>
    </MockFrame>
  );
}

function MockWebApp() {
  return (
    <MockFrame>
      <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: COLOR.textMuted }}>
        Breakfast
      </span>
      <p className="text-xs leading-5" style={{ color: COLOR.textPrimary }}>
        2 eggs, toast, black coffee
      </p>
      <div className="h-px w-full" style={{ backgroundColor: COLOR.border }} />
      <span className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: COLOR.textMuted }}>
        Workout
      </span>
      <p className="text-xs leading-5" style={{ color: COLOR.textPrimary }}>
        Push day — 4 exercises
      </p>
    </MockFrame>
  );
}

function MockAiReports() {
  return (
    <MockFrame>
      <div className="flex items-center gap-2.5">
        <span
          className="flex size-9 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
        >
          82
        </span>
        <span className="text-xs font-semibold" style={{ color: COLOR.textPrimary }}>
          Overall score
        </span>
      </div>
      <p className="text-[11px] leading-5 italic" style={{ color: COLOR.textSecondary }}>
        &ldquo;Protein cleared target from whole-food sources.&rdquo;
      </p>
    </MockFrame>
  );
}

function MockContextEngine() {
  return (
    <MockFrame>
      <div className="flex items-baseline justify-between">
        <span className="text-base font-bold" style={{ color: COLOR.textPrimary }}>
          1650 <span className="text-[10px] font-normal" style={{ color: COLOR.textMuted }}>kcal</span>
        </span>
        <span className="text-[11px]" style={{ color: COLOR.mint }}>
          −299 deficit
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {["P", "C", "F", "Fb"].map((m) => (
          <div key={m} className="rounded-lg py-1.5 text-center" style={{ backgroundColor: COLOR.cardElevated }}>
            <span className="text-[9px]" style={{ color: COLOR.textMuted }}>
              {m}
            </span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function MockNativeApp() {
  return (
    <MockFrame>
      <div
        className="flex flex-col gap-2 rounded-2xl border p-2.5"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <span className="mx-auto h-1 w-8 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        <div className="flex items-center justify-between">
          <Footprints className="size-3.5" style={{ color: COLOR.mint }} />
          <span className="text-[11px] font-bold" style={{ color: COLOR.textPrimary }}>
            10,482
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Dumbbell className="size-3.5" style={{ color: COLOR.mint }} />
          <span className="text-[11px] font-bold" style={{ color: COLOR.textPrimary }}>
            Logged
          </span>
        </div>
      </div>
    </MockFrame>
  );
}

function MockHulkToday() {
  return (
    <MockFrame>
      <div className="flex items-center justify-between">
        <span
          className="flex size-8 items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: COLOR.mintGlow, color: COLOR.mint }}
        >
          88
        </span>
        <span className="text-[11px]" style={{ color: COLOR.mint }}>
          −299 kcal
        </span>
      </div>
      <div className="h-px w-full" style={{ backgroundColor: COLOR.border }} />
      <p className="text-[11px] leading-5" style={{ color: COLOR.textSecondary }}>
        16,000 steps · 8 exercises · sleep on target
      </p>
    </MockFrame>
  );
}

const TIMELINE = [
  { name: "Idea", sentence: "A note that said “log everything in one place.”", Mock: MockIdea },
  { name: "Web App", sentence: "One journal instead of four separate apps.", Mock: MockWebApp },
  { name: "AI Reports", sentence: "A nightly coach, pasted in by hand at first.", Mock: MockAiReports },
  { name: "Context Engine", sentence: "Numbers that finally agreed with each other.", Mock: MockContextEngine },
  { name: "Native App", sentence: "The same brain, in your pocket.", Mock: MockNativeApp },
  { name: "Hulk Today", sentence: "Log once. Understand the whole day.", Mock: MockHulkToday },
] as const;

/* ---------------------------------------------------------------------- */
/* 3. The Evolution                                                        */
/* ---------------------------------------------------------------------- */

function EvolutionSection() {
  return (
    <Section eyebrow="The evolution">
      <Reveal>
        <h2
          className="text-4xl leading-[1.05] font-black tracking-tight text-balance sm:text-5xl"
          style={{ color: COLOR.textPrimary }}
        >
          Six versions. One question.
        </h2>
      </Reveal>
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
        {TIMELINE.map(({ name, sentence, Mock }, index) => (
          <Reveal key={name} delay={index * 80} className="flex shrink-0 snap-start flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tabular-nums" style={{ color: COLOR.mint }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-bold" style={{ color: COLOR.textPrimary }}>
                {name}
              </span>
            </div>
            <Mock />
            <p className="max-w-[220px] text-xs leading-5" style={{ color: COLOR.textSecondary }}>
              {sentence}
            </p>
            {index < TIMELINE.length - 1 && (
              <ArrowRight className="mt-1 size-4" style={{ color: COLOR.textMuted }} />
            )}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */
/* 4. "Then AI started doing weird things."                               */
/* ---------------------------------------------------------------------- */

function useCountUp(target: number, active: boolean, delayMs: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const timeout = setTimeout(() => {
      const start = performance.now();
      function tick(now: number) {
        const progress = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));
        if (progress < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [active, target, delayMs, durationMs]);
  return value;
}

const DEFICITS = [-150, -350, -600] as const;

function DeficitChips({ active }: { active: boolean }) {
  // Three fixed hook calls, not a .map() over them — DEFICITS never changes
  // length, but calling a hook from inside a loop callback is exactly the
  // kind of thing worth just not doing.
  const values = [
    useCountUp(DEFICITS[0], active, 0),
    useCountUp(DEFICITS[1], active, 500),
    useCountUp(DEFICITS[2], active, 1000),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {values.map((value, index) => (
        <div key={DEFICITS[index]} className="flex items-center gap-3">
          <span
            className="rounded-2xl border px-4 py-2.5 text-2xl font-black tabular-nums sm:text-3xl"
            style={{
              borderColor: index === values.length - 1 ? COLOR.mint : COLOR.border,
              color: index === values.length - 1 ? COLOR.mint : COLOR.textPrimary,
              backgroundColor: COLOR.card,
            }}
          >
            {value} kcal
          </span>
          {index < values.length - 1 && <ArrowRight className="size-4" style={{ color: COLOR.textMuted }} />}
        </div>
      ))}
    </div>
  );
}

function AIChaosSection() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <Section eyebrow="Then AI started doing weird things">
      <div ref={ref} className="flex flex-col gap-6">
        <DeficitChips active={inView} />
        <p className="text-lg font-semibold" style={{ color: COLOR.textPrimary }}>
          Same day. Three answers.
        </p>
        <div
          style={{
            opacity: inView ? 1 : 0,
            transition: "opacity 700ms var(--ease-out-expo) 2200ms",
          }}
        >
          <p className="text-2xl leading-tight font-bold text-balance sm:text-3xl" style={{ color: COLOR.mint }}>
            The problem wasn&rsquo;t always the AI.
            <br />
            Sometimes it was the context.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */
/* 5. Decisions I Made                                                     */
/* ---------------------------------------------------------------------- */

const DECISIONS = [
  { title: "SQLite", body: "Personal data should work offline." },
  { title: "AI Context Engine", body: "Raw data isn't context." },
  { title: "Manual AI fallback", body: "Don't let automation become a black box." },
  { title: "Privacy", body: "Not everything needs to leave the device." },
  { title: "Verification", body: "If AI says it, I still check it." },
] as const;

function DecisionCard({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      aria-expanded={open}
      className="flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition-all duration-300 active:scale-[0.98]"
      style={{
        borderColor: open ? `${COLOR.mint}55` : COLOR.border,
        backgroundColor: open ? COLOR.cardElevated : COLOR.card,
      }}
    >
      <span className="text-sm font-bold" style={{ color: COLOR.textPrimary }}>
        {title}
      </span>
      <p
        className="text-sm leading-6"
        style={{
          color: COLOR.mint,
          maxHeight: open ? "80px" : "0px",
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "all 300ms var(--ease-out-expo)",
        }}
      >
        {body}
      </p>
    </button>
  );
}

function DecisionsSection() {
  return (
    <Section eyebrow="Decisions I made">
      <Reveal>
        <h2 className="text-3xl font-black tracking-tight" style={{ color: COLOR.textPrimary }}>
          A few calls I&rsquo;m not walking back.
        </h2>
      </Reveal>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DECISIONS.map((decision, index) => (
          <Reveal key={decision.title} delay={index * 60}>
            <DecisionCard {...decision} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */
/* 6. Things I Got Wrong                                                   */
/* ---------------------------------------------------------------------- */

const GOT_WRONG = [
  { verdict: "Blamed the AI.", detail: "Recovery score: 58 → 90. Same day.", wrong: true },
  { verdict: "Blamed the prompt.", detail: "A rest day scored zero for effort.", wrong: true },
  { verdict: "Blamed the model.", detail: "It was a rate limit.", wrong: true },
  { verdict: "It was actually my rendering logic.", detail: "The data was correct the whole time.", wrong: false },
] as const;

function GotWrongSection() {
  return (
    <Section eyebrow="Things I got wrong">
      <Reveal>
        <h2 className="text-3xl font-black tracking-tight" style={{ color: COLOR.textPrimary }}>
          A very honest debug log.
        </h2>
      </Reveal>
      <div className="flex flex-col gap-2 font-mono">
        {GOT_WRONG.map((item, index) => (
          <Reveal key={item.verdict} delay={index * 90}>
            <div
              className="flex items-center gap-3 rounded-xl border px-4 py-3"
              style={{ borderColor: COLOR.border, backgroundColor: COLOR.card }}
            >
              {item.wrong ? (
                <XCircle className="size-4 shrink-0" style={{ color: "#71717A" }} />
              ) : (
                <CheckCircle2 className="size-4 shrink-0" style={{ color: COLOR.mint }} />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2.5">
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: item.wrong ? COLOR.textSecondary : COLOR.mint,
                    textDecoration: item.wrong ? "line-through" : "none",
                    textDecorationColor: "rgba(161,161,170,0.5)",
                  }}
                >
                  {item.verdict}
                </span>
                <span className="text-xs" style={{ color: COLOR.textMuted }}>
                  {item.detail}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={GOT_WRONG.length * 90}>
        <p className="text-sm font-semibold" style={{ color: COLOR.textMuted }}>
          Classic.
        </p>
      </Reveal>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */
/* 7. Hulk Today                                                           */
/* ---------------------------------------------------------------------- */

const FLOW = ["LOG", "CONTEXT", "AI", "INSIGHT"] as const;

function TodaySection() {
  const glowRef = useParallax(0.1);
  return (
    <Section eyebrow="Right now" className="relative overflow-hidden">
      <div
        ref={glowRef}
        className="pointer-events-none absolute top-10 right-[-15%] size-[420px] rounded-full"
        style={{ background: `radial-gradient(circle, ${COLOR.mintGlow} 0%, transparent 70%)` }}
      />
      <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4">
          <Reveal>
            <h2
              className="text-5xl leading-[0.98] font-black tracking-tight sm:text-6xl"
              style={{ color: COLOR.textPrimary }}
            >
              So this is Hulk.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-sm text-base leading-7" style={{ color: COLOR.textSecondary }}>
              A personal system for turning everyday health data into something I can actually understand.
            </p>
          </Reveal>
        </div>
        <Reveal delay={160}>
          <MockHulkToday />
        </Reveal>
      </div>
      <Reveal delay={240} className="flex flex-wrap items-center gap-2.5">
        {FLOW.map((step, index) => (
          <div key={step} className="flex items-center gap-2.5">
            <span
              className="rounded-full border px-4 py-2 text-xs font-bold tracking-[0.1em]"
              style={{
                borderColor: index === FLOW.length - 1 ? "transparent" : COLOR.border,
                backgroundColor: index === FLOW.length - 1 ? COLOR.mint : "transparent",
                color: index === FLOW.length - 1 ? COLOR.bg : COLOR.textSecondary,
              }}
            >
              {step}
            </span>
            {index < FLOW.length - 1 && <ArrowRight className="size-3.5" style={{ color: COLOR.textMuted }} />}
          </div>
        ))}
      </Reveal>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */
/* 8. Ending                                                               */
/* ---------------------------------------------------------------------- */

function EndingSection() {
  return (
    <section className="flex flex-col items-center gap-10 px-5 py-28 text-center">
      <Reveal>
        <CircleDashed className="size-6" style={{ color: COLOR.textMuted }} />
      </Reveal>
      <Reveal delay={80}>
        <h2
          className="max-w-lg text-3xl leading-tight font-black tracking-tight text-balance sm:text-4xl"
          style={{ color: COLOR.textPrimary }}
        >
          Still building. Still breaking things. Still learning.
        </h2>
      </Reveal>
      <Reveal delay={160}>
        <span className="text-xs font-bold tracking-[0.28em]" style={{ color: COLOR.textMuted }}>
          PROJECT HULK — 2026
        </span>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="flex flex-wrap justify-center gap-5 px-5 py-8" style={{ borderTop: `1px solid ${COLOR.border}` }}>
      {[
        { href: "/welcome", label: "Home" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/signup", label: "Create free account" },
      ].map((link) => (
        <Link key={link.label} href={link.href} className="text-xs" style={{ color: COLOR.textMuted }}>
          {link.label}
        </Link>
      ))}
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
      <div className="mx-auto flex max-w-md flex-col overflow-x-hidden md:max-w-2xl">
        <Header />
        <Hero />
        <ProblemSection />
        <EvolutionSection />
        <AIChaosSection />
        <DecisionsSection />
        <GotWrongSection />
        <TodaySection />
        <EndingSection />
        <Footer />
      </div>
    </div>
  );
}
