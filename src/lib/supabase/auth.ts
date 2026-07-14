import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";
import { getProfile } from "@/lib/profile/queries";
import type { Database } from "./database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * supabase.auth.getUser() makes a real network round-trip to Supabase's
 * Auth server every time it's called (it re-validates the JWT server-side,
 * unlike reading a session from cookies). requireUser() is called
 * independently by dozens of query/action functions, and a single page
 * load fans out into many of them in parallel — without memoization, that
 * was one Auth-server round-trip PER CALL, all firing concurrently on
 * every navigation. React's cache() dedupes calls with identical arguments
 * within one request, so this now costs exactly one round-trip per
 * request no matter how many functions call requireUser().
 */
const getCachedAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const { supabase, user } = await requireUser();
  const profile = await getProfile();

  if (!profile || !profile.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}
