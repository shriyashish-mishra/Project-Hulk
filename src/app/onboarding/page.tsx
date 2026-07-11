import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { requireUser } from "@/lib/supabase/auth";

/** State 3 guard: an already-onboarded user must never re-enter onboarding. */
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

  return <OnboardingFlow />;
}
