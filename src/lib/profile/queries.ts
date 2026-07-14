import { getUserContextRpc } from "./rpc";
import type { Profile } from "./types";

/**
 * Derives from the same cached get_user_context RPC that getUserContext()
 * uses (see rpc.ts) — requireOnboardedUser()'s gate check and full
 * personalization now share one Postgres round-trip per request instead of
 * two, no matter which of getProfile()/getUserContext() gets called first.
 */
export async function getProfile(): Promise<Profile | null> {
  const { profile } = await getUserContextRpc();
  return profile as Profile | null;
}

export async function isOnboardingComplete(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.onboarding_completed_at != null;
}
