"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";

export interface AuthResult {
  error?: string;
  needsEmailConfirmation?: boolean;
}

async function getSiteOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${h.get("host")}`;
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };
  if (!data.session) return { needsEmailConfirmation: true };

  redirect("/");
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/");
}

export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Emails a recovery link pointed at /auth/confirm, which exchanges the token for a session and lands the user on /update-password. */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = await createClient();
  const origin = await getSiteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/update-password`,
  });

  if (error) return { error: error.message };
  return {};
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };
  redirect("/");
}
