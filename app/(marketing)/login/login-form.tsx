"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/browser";

type Mode = "signin" | "signup";
type State = "idle" | "submitting" | "sent" | "error";

const MIN_PASSWORD = 8;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";
  const initialMode: Mode = params.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState(() => params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === "signup" && password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      setState("error");
      return;
    }
    setError(null);
    setState("submitting");

    try {
      const supabase = getBrowserClient();
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (err) throw new Error(friendlyError(err.message));
        router.push(next);
        router.refresh();
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (err) throw new Error(friendlyError(err.message));
        // If email confirmation is OFF, Supabase returns a session immediately.
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          // Confirmation email sent.
          setState("sent");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-center">
        <p className="text-sm font-semibold text-brand-800">
          One more step — check your inbox.
        </p>
        <p className="mt-1.5 text-xs text-brand-700">
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          finish creating your account.
        </p>
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setMode("signin");
            setPassword("");
          }}
          className="mt-4 text-xs font-medium text-brand-700 underline hover:text-brand-900"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="mb-6 inline-flex w-full rounded-full border border-border bg-subtle/50 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setState("idle");
            setError(null);
          }}
          className={[
            "flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition",
            mode === "signin"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setState("idle");
            setError(null);
          }}
          className={[
            "flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition",
            mode === "signup"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          Create account
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
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
        </div>

        <div className="relative">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              mode === "signup"
                ? `At least ${MIN_PASSWORD} characters`
                : "Your password"
            }
            minLength={mode === "signup" ? MIN_PASSWORD : undefined}
            className="h-12 w-full rounded-full border border-border bg-surface pl-5 pr-12 text-sm placeholder:text-muted focus:border-brand-400"
            disabled={state === "submitting"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {mode === "signin" && (
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-foreground/70 hover:text-brand-700"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={state === "submitting"}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-60"
        >
          {state === "submitting"
            ? mode === "signin"
              ? "Signing in…"
              : "Creating account…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
          {state !== "submitting" && <span aria-hidden>→</span>}
        </button>

        {state === "error" && error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid_credentials")) {
    return "Wrong email or password. Try again, or use 'Forgot password?'.";
  }
  if (m.includes("user already registered") || m.includes("already exists")) {
    return "An account with this email already exists. Try signing in.";
  }
  if (m.includes("email not confirmed")) {
    return "We sent a confirmation link to your inbox — click it before signing in.";
  }
  if (m.includes("rate limit")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return message;
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c6.5 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 002 12s3.5 7 10 7a9.74 9.74 0 005.39-1.61" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
      <path d="M2 2l20 20" />
    </svg>
  );
}
