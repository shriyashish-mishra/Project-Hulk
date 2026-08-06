"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function WelcomeHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-black tracking-tight text-foreground">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
            PH
          </span>
          Project Hulk
        </span>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-9 items-center justify-center rounded-full text-foreground active:opacity-60"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-xl">
          <a
            href="#features"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground active:bg-muted"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground active:bg-muted"
          >
            How it works
          </a>
          <div className="my-1 border-t border-border" />
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground active:bg-muted"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground active:opacity-80"
          >
            Create free account
          </Link>
        </div>
      )}
    </div>
  );
}
