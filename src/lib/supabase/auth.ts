import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";

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
