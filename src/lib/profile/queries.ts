import { cache } from "react";
import { requireUser } from "@/lib/supabase/auth";
import type { Profile } from "./types";

/**
 * Gated pages call requireOnboardedUser() (its own profiles query, for the
 * onboarding-complete check) AND getUserContext() (which calls this), so
 * without memoization every one of those pages queried profiles twice.
 * Same per-request dedup as requireUser() — see lib/supabase/auth.ts.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Profile | null;
});

export async function isOnboardingComplete(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.onboarding_completed_at != null;
}
