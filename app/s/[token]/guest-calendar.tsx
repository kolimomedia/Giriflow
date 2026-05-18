"use client";

import { useMemo, useState } from "react";
import { channelMeta, statusMeta } from "@/lib/channels";
import type { Post } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function GuestCalendar({
  posts,
  initialYear,
  initialMonth0,
  workspaceName,
}: {
  posts: Post[];
  initialYear: number;
  initialMonth0: number;
  workspaceName: string;
}) {
  const [year, setYear] = useState(initialYear);
  const [month0, setMonth0] = useState(initialMonth0);
  const [open, setOpen] = useState<Post | null>(null);

  const cells = useMemo(() => buildMonthCells(year, month0), [year, month0]);
  const todayKey = ymd(new Date());

  function shift(delta: number) {
    let m = month0 + delta;
    let y = year;
    while (m < 0) { m += 12; y -= 1; }
    while (m > 11) { m -= 12; y += 1; }
    setMonth0(m);
    setYear(y);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {MONTHS[month0]} {year}
          </h2>
          <p className="text-xs text-muted">{workspaceName}</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-border bg-subtle/50 p-0.5">
          <button
            onClick={() => shift(-1)}
            className="rounded-full px-3 py-1.5 text-xs hover:bg-surface"
          >
            ← Prev
          </button>
          <button
            onClick={() => {
              const t = new Date();
              setYear(t.getUTCFullYear());
              setMonth0(t.getUTCMonth());
            }}
            className="rounded-full px-3 py-1.5 text-xs font-medium"
          >
            Today
          </button>
          <button
            onClick={() => shift(1)}
            className="rounded-full px-3 py-1.5 text-xs hover:bg-surface"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid grid-cols-7 border-b border-border bg-subtle/50">
          {DAYS.map((d) => (
            <div
              key={d}
              className="px-1 py-2 text-center text-[9px] font-semibold uppercase tracking-widest text-muted sm:px-3 sm:text-left sm:text-[10px]"
            >
              <span className="sm:hidden">{d.slice(0, 1)}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            const dayPosts = postsOn(posts, c.date);
            const inMonth = c.date.getUTCMonth() === month0;
            const isToday = ymd(c.date) === todayKey;
            return (
              <div
                key={i}
                className={[
                  "min-h-[64px] border-b border-r border-border p-1 sm:min-h-[120px] sm:p-2",
                  inMonth ? "bg-surface" : "bg-subtle/30",
                  (i + 1) % 7 === 0 ? "border-r-0" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                    isToday
                      ? "bg-brand-500 text-white"
                      : inMonth
                        ? "text-foreground/70"
                        : "text-muted",
                  ].join(" ")}
                >
                  {c.date.getUTCDate()}
                </span>
                {/* Mobile: colored dots, taps open the post. */}
                <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                  {dayPosts.slice(0, 5).map((p) => {
                    const m = channelMeta[p.channel];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setOpen(p)}
                        aria-label={p.title || "Post"}
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: m.color }}
                      />
                    );
                  })}
                  {dayPosts.length > 5 && (
                    <span className="text-[8px] leading-none text-muted">
                      +{dayPosts.length - 5}
                    </span>
                  )}
                </div>
                {/* Tablet+: full chips. */}
                <div className="mt-1 hidden space-y-1 sm:block">
                  {dayPosts.slice(0, 4).map((p) => {
                    const m = channelMeta[p.channel];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setOpen(p)}
                        className="block w-full rounded-md border-l-2 bg-white/70 px-2 py-1 text-left hover:-translate-y-0.5 hover:shadow-sm transition"
                        style={{ borderColor: m.color }}
                      >
                        <span
                          className="rounded px-1 py-0.5 text-[9px] font-semibold"
                          style={{ background: m.bg, color: m.text }}
                        >
                          {m.short}
                        </span>{" "}
                        <span className="text-[11px] font-medium">
                          {p.title || p.caption.slice(0, 30) || "Post"}
                        </span>
                      </button>
                    );
                  })}
                  {dayPosts.length > 4 && (
                    <p className="px-1 text-[10px] text-muted">
                      +{dayPosts.length - 4} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {open && <PostPreview post={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function PostPreview({ post, onClose }: { post: Post; onClose: () => void }) {
  const m = channelMeta[post.channel];
  const s = statusMeta[post.status];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ background: m.bg, color: m.text }}
            >
              {m.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
              {s.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-subtle"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 p-6">
          {post.title && (
            <h3 className="text-base font-semibold">{post.title}</h3>
          )}
          {post.caption && (
            <p className="whitespace-pre-wrap text-sm text-foreground/85">
              {post.caption}
            </p>
          )}
          {post.reference_links && post.reference_links.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
                References
              </p>
              <ul className="space-y-1">
                {post.reference_links.map((link, idx) => (
                  <li key={`${link.url}-${idx}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border bg-subtle/40 px-2.5 py-1.5 text-xs hover:border-brand-300"
                    >
                      <span
                        className="truncate font-medium text-foreground/85"
                      >
                        {link.label || hostFromUrl(link.url)}
                      </span>
                      <span className="ml-auto truncate font-mono text-[10px] text-muted">
                        {hostFromUrl(link.url)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="font-mono text-xs text-muted">
            Scheduled for{" "}
            {new Date(post.scheduled_at).toLocaleString(undefined, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function buildMonthCells(year: number, month0: number): { date: Date }[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const day = first.getUTCDay();
  const offset = (day + 6) % 7;
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return { date: d };
  });
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function postsOn(posts: Post[], d: Date): Post[] {
  const key = ymd(d);
  return posts
    .filter((p) => p.scheduled_at.startsWith(key))
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
}
