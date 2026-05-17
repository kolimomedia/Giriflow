"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

type State = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/app";
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("sending");
    setError(null);
    try {
      const supabase = getBrowserClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
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
        <p className="text-sm font-medium text-brand-800">
          Check your inbox.
        </p>
        <p className="mt-1 text-xs text-brand-700">
          We sent a sign-in link to <strong>{email}</strong>. It expires in
          1 hour.
        </p>
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setEmail("");
          }}
          className="mt-3 text-xs font-medium text-brand-700 underline hover:text-brand-900"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="email" className="sr-only">
          Work email
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
          disabled={state === "sending"}
        />
      </div>
      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "sending" ? "Sending link…" : "Send magic link"}
        <span aria-hidden>→</span>
      </button>
      {state === "error" && error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
