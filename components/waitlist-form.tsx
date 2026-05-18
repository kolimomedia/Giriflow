"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Trial sign-up CTA — captures an email on the marketing site and
 * hands off to /login?mode=signup&email=… so the user lands on the
 * Create account tab with their email already filled in.
 *
 * (Originally a waitlist form; the marketing surface no longer uses
 * "early access" framing, but the filename and exports stay the same
 * to avoid breaking imports.)
 */
export function WaitlistForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    const url =
      "/login?mode=signup&email=" + encodeURIComponent(email.trim().toLowerCase());
    router.push(url);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
    >
      <label htmlFor="trial-email" className="sr-only">
        Work email
      </label>
      <input
        id="trial-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@studio.com"
        className="h-12 flex-1 rounded-full border border-border bg-surface px-5 text-sm placeholder:text-muted focus:border-brand-400"
        disabled={busy}
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "Taking you in…" : "Start free trial"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}

/** Same component under a clearer name, for places that import the new alias. */
export const TrialSignupForm = WaitlistForm;
