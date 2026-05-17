"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

const MIN_PASSWORD = 8;

type State = "idle" | "submitting" | "done" | "error";

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      setState("error");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      setState("error");
      return;
    }
    setError(null);
    setState("submitting");
    try {
      const supabase = getBrowserClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw new Error(err.message);
      setState("done");
      setTimeout(() => {
        router.push("/app");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center">
        <p className="text-sm font-semibold text-brand-800">
          Password updated.
        </p>
        <p className="mt-1.5 text-xs text-brand-700">
          Taking you to your calendar…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="password"
        required
        autoFocus
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={`New password (min ${MIN_PASSWORD} chars)`}
        minLength={MIN_PASSWORD}
        className="h-12 w-full rounded-full border border-border bg-surface px-5 text-sm placeholder:text-muted focus:border-brand-400"
        disabled={state === "submitting"}
      />
      <input
        type="password"
        required
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm password"
        minLength={MIN_PASSWORD}
        className="h-12 w-full rounded-full border border-border bg-surface px-5 text-sm placeholder:text-muted focus:border-brand-400"
        disabled={state === "submitting"}
      />
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "submitting" ? "Saving…" : "Set new password"}
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
