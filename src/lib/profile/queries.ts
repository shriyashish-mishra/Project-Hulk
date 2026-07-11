import { requireUser } from "@/lib/supabase/auth";
import type { Profile } from "./types";

export async function getProfile(): Promise<Profile | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Profile | null;
}

export async function isOnboardingComplete(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.onboarding_completed_at != null;
}
