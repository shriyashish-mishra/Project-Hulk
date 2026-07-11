import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";
import type { Database } from "./database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}
