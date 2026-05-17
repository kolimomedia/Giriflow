"use client";

import { useState } from "react";
import { getBrowserClient, hasSupabaseConfig } from "@/lib/supabase/browser";

type State = "idle" | "submitting" | "done" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("submitting");
    setError(null);

    try {
      if (hasSupabaseConfig()) {
        const supabase = getBrowserClient();
        const { error: insertError } = await supabase
          .from("waitlist")
          .insert({
            email: email.trim().toLowerCase(),
            source: "marketing-site",
            referrer: typeof document !== "undefined" ? document.referrer || null : null,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          });

        if (insertError) {
          // 23505 = unique_violation: already on the list. Treat as success.
          if (insertError.code !== "23505") {
            throw new Error(insertError.message);
          }
        }
      } else {
        // No Supabase configured yet — pretend (dev/preview mode).
        await new Promise((r) => setTimeout(r, 500));
      }

      setState("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-5 py-3 text-sm font-medium text-brand-700">
        <span aria-hidden>✓</span>
        You're on the list. We'll be in touch from hello@giriflow.com.
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
        disabled={state === "submitting"}
      />
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Get early access"}
        <span aria-hidden>→</span>
      </button>
      {state === "error" && error && (
        <p
          role="alert"
          className="mt-1 w-full text-xs text-red-600 sm:mt-2"
        >
          {error}
        </p>
      )}
    </form>
  );
}
