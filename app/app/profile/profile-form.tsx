"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { updateProfile } from "@/app/app/actions";

// A short, opinionated timezone list (full IANA list is 400+ entries).
const COMMON_TIMEZONES = [
  "UTC",
  "Africa/Lagos",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function ProfileForm({ initial, email }: { initial: Profile; email: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url ?? "");
  const [timezone, setTimezone] = useState(initial.timezone || "UTC");
  const [busy, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function detectTimezone() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setTimezone(tz);
    } catch {
      // ignore
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setError(null);
    startTransition(async () => {
      try {
        await updateProfile({
          display_name: displayName,
          avatar_url: avatarUrl,
          timezone,
        });
        setStatus("saved");
        router.refresh();
        setTimeout(() => setStatus("idle"), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
        setStatus("error");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Identity
        </h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
            <label className="text-sm text-foreground/70">Email</label>
            <p className="font-mono text-sm">{email}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
            <label htmlFor="display_name" className="text-sm text-foreground/70">
              Display name
            </label>
            <input
              id="display_name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Kola"
              maxLength={80}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm focus:border-brand-400"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-start">
            <label htmlFor="avatar_url" className="pt-2 text-sm text-foreground/70">
              Avatar URL
            </label>
            <div>
              <input
                id="avatar_url"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…/me.jpg"
                maxLength={500}
                className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-brand-400"
              />
              {avatarUrl && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                  Preview:
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full border border-border object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Time zone
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
          <label htmlFor="timezone" className="text-sm text-foreground/70">
            Your time zone
          </label>
          <div className="flex gap-2">
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm focus:border-brand-400"
            >
              {!COMMON_TIMEZONES.includes(timezone) && (
                <option value={timezone}>{timezone}</option>
              )}
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={detectTimezone}
              className="rounded-xl border border-border px-3 text-xs font-medium text-foreground/75 hover:border-brand-300 hover:text-brand-700"
            >
              Detect
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted sm:ml-[148px]">
          Used to display scheduled times in the calendar.
        </p>
      </section>

      <div className="flex items-center justify-end gap-3">
        {status === "saved" && (
          <span className="text-xs font-medium text-brand-700">Saved ✓</span>
        )}
        {status === "error" && error && (
          <span className="text-xs text-red-600">{error}</span>
        )}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
