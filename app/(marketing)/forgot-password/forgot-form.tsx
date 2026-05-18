"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

type State = "idle" | "submitting" | "sent" | "error";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("submitting");
    setError(null);
    try {
      const supabase = getBrowserClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
        },
      );
      if (err) throw new Error(err.message);
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center">
        <p className="text-sm font-semibold text-brand-800">
          Reset link sent.
        </p>
        <p className="mt-1.5 text-xs text-brand-700">
          If an account exists for <strong>{email}</strong>, you'll get an email
          with a reset link in the next minute.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        autoFocus
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@studio.com"
        className="h-12 w-full rounded-full border border-border bg-surface px-5 text-sm placeholder:text-muted focus:border-brand-400"
        disabled={state === "submitting"}
      />
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Send reset link"}
        <span aria-hidden>→</span>
      </button>
      {state === "error" && error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
