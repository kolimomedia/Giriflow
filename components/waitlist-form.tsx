"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("submitting");
    setTimeout(() => setState("done"), 600);
  }

  if (state === "done") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-5 py-3 text-sm font-medium text-brand-700">
        <span aria-hidden>✓</span>
        You're on the list. We'll be in touch from {`hello@giriflow.com`}.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
    >
      <label htmlFor="waitlist-email" className="sr-only">
        Work email
      </label>
      <input
        id="waitlist-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@studio.com"
        className="h-12 flex-1 rounded-full border border-border bg-surface px-5 text-sm placeholder:text-muted focus:border-brand-400"
      />
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Get early access"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
