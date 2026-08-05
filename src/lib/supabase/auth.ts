import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";
import { getProfile } from "@/lib/profile/queries";
import type { Database } from "./database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * The Supabase client itself needs no network round-trip to construct — it
 * just wraps cookies(). Cached separately from getCachedAuthUser() so
 * callers that only need to make their own authenticated request (RLS/RPC
 * calls validate the JWT on the DB side) aren't forced to wait behind the
 * getUser() Auth-server round-trip below just to get a client instance.
 */
const getCachedSupabaseClient = cache(async () => createClient());

/**
 * getClaims() verifies the JWT locally (WebCrypto + a cached JWKS lookup)
 * instead of round-tripping to the Auth server like getUser() does — the
 * same fix proxy.ts already applies for this exact reason. requireUser()
 * is called by nearly every server action and page in the app (a single
 * click can be one Server Action invocation, i.e. one fresh request, so
 * cache() below only dedupes calls *within* that one request — it can't
 * save the round-trip itself). Every real call site only ever reads
 * `user.id`, which is exactly the JWT's `sub` claim, so no call site loses
 * anything by getting a minimal `{ id }` object instead of the full
 * `getUser()`-fetched profile record. RLS (auth.uid() = user_id) is the
 * real security boundary regardless of which of these two methods
 * produced the id used to build a request.
 */
const getCachedAuthUser = cache(async () => {
  const supabase = await getCachedSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ? ({ id: data.claims.sub } as User) : null;
  return { supabase, user };
});

/**
 * proxy.ts handles the redirect UX, but Next.js explicitly warns that
 * it "should not be used as a full session management or authorization
 * solution" — every Server Component/Action that touches user data
 * verifies auth itself too. RLS (auth.uid() = user_id) is the real
 * security boundary; this is the second layer.
 */
export async function requireUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
}> {
  const { supabase, user } = await getCachedAuthUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

/** The client alone, without waiting on the getUser() Auth round-trip — see getCachedSupabaseClient(). */
export async function getSupabaseClient(): Promise<Awaited<ReturnType<typeof createClient>>> {
  return getCachedSupabaseClient();
}

/**
 * The third routing state: authenticated but onboarding incomplete gets
 * bounced to /onboarding. Only top-level app pages call this — /onboarding
 * itself, and the password-recovery pages, call plain requireUser() since
 * they must not require onboarding to already be done.
 */
export async function requireOnboardedUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  profile: ProfileRow;
}> {
  // Fire the profile RPC before awaiting requireUser() so the two network
  // round-trips overlap instead of running back-to-back. requireUser() is
  // still awaited first and is still what decides the /login redirect, so
  // behavior is unchanged — this only removes the artificial serialization.
  // The catch here just prevents an unhandled-rejection warning if
  // requireUser() redirects before profilePromise is awaited below.
  const profilePromise = getProfile();
  profilePromise.catch(() => {});

  const { supabase, user } = await requireUser();
  const profile = await profilePromise;

  if (!profile || !profile.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}
