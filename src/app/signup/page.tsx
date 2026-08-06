"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/actions";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Captured once, at first render, not on every keystroke — the server
  // compares this against its own clock when the submission arrives.
  const [renderedAt] = useState(() => Date.now());

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signUp(email, password, acceptedTerms, honeypot, renderedAt);
      if (result?.error) {
        setError(result.error);
      } else if (result?.needsEmailConfirmation) {
        setNeedsConfirmation(true);
      }
    });
  }

  if (needsConfirmation) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-5 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <MailCheck className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We sent a confirmation link to {email}. Follow it to activate
            your account, then log in.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/login" />}>
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center gap-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Get started
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-foreground">
          Sign up
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Honeypot — real users never see this field (off-screen, unreachable by tab), so anything typed into it means a bot auto-filled every field it could find. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            required
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="text-primary underline-offset-4 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={isPending || !acceptedTerms}>
          {isPending ? "Signing up…" : "Sign up"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
