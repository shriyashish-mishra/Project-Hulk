"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth/actions";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(email);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsSent(true);
      }
    });
  }

  if (isSent) {
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
            If an account exists for {email}, we sent a link to reset your
            password.
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
          Account recovery
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&rsquo;ll send you a link to set a new
          password.
        </p>
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}
