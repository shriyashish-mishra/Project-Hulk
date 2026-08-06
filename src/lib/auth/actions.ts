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

/** Below this, a submission is almost certainly scripted — no real person reads the form and types an email/password faster than this. */
const MIN_SUBMIT_MS = 1500;
const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * Two lightweight, zero-dependency bot checks ahead of the real signup —
 * a honeypot field (`website`) invisible to real users but often
 * auto-filled by naive form-spam bots, and a minimum elapsed time between
 * when the form rendered and when it was submitted. Neither defeats a
 * determined, targeted attacker (a real CAPTCHA like Cloudflare Turnstile
 * would be the upgrade for that) — this is specifically aimed at generic
 * scripted signup spam, which is the more common threat for a public
 * form with no protection at all. Fails with the same generic message a
 * real error would show, so a bot gets no signal about which check it
 * tripped.
 */
export async function signUp(
  email: string,
  password: string,
  acceptedTerms: boolean,
  honeypot: string,
  renderedAt: number,
): Promise<AuthResult> {
  if (honeypot.trim() !== "" || Date.now() - renderedAt < MIN_SUBMIT_MS) {
    return { error: GENERIC_ERROR };
  }
  if (!acceptedTerms) {
    return { error: "You must agree to the Terms of Service and Privacy Policy to continue." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { terms_accepted_at: new Date().toISOString() } },
  });

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
