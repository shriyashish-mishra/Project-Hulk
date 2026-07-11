import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";

/** State 3 guard: an already-onboarded user must never re-enter onboarding. The actual step flow is built next (Phase 3) — this currently only wires the routing. */
export default async function OnboardingPage() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed_at) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        Welcome
      </p>
      <h1 className="text-3xl font-black tracking-tight text-foreground">
        Let&rsquo;s get you set up
      </h1>
    </div>
  );
}
