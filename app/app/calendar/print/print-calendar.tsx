"use client";

import { useEffect } from "react";
import { channelMeta } from "@/lib/channels";
import { LogoMarkFlat } from "@/components/logo";
import type { Post } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PrintCalendar({
  workspaceName,
  year,
  month0,
  posts,
}: {
  workspaceName: string;
  year: number;
  month0: number;
  posts: Post[];
}) {
  // Auto-trigger the print dialog on open. The user can cancel and re-trigger.
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);

  const cells = buildMonthCells(year, month0);

  return (
    <div className="mx-auto max-w-[1100px] bg-white p-8 text-foreground print:p-0">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mb-4 flex items-center justify-between border-b border-border pb-4">
        <p className="text-sm text-muted">
          The print dialog should open automatically. Save as PDF from there.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-brand-700"
        >
          Print again
        </button>
      </div>

      <header className="mb-6 flex items-end justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Social media plan
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {workspaceName} — {MONTHS[month0]} {year}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-right">
          <LogoMarkFlat className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold">GiriFlow</p>
            <p className="text-[10px] text-muted">giriflow.com</p>
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-7 border-b border-border bg-subtle/40">
          {DAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            const dayPosts = postsOn(posts, c.date);
            const inMonth = c.date.getUTCMonth() === month0;
            return (
              <div
                key={i}
                className={[
                  "min-h-[110px] border-b border-r border-border p-1.5",
                  inMonth ? "bg-white" : "bg-subtle/30",
                  (i + 1) % 7 === 0 ? "border-r-0" : "",
                ].join(" ")}
              >
                <div className="mb-1 text-[10px] font-semibold text-foreground/70">
                  {c.date.getUTCDate()}
                </div>
                <div className="space-y-1">
                  {dayPosts.map((p) => {
                    const m = channelMeta[p.channel];
                    const time = new Date(p.scheduled_at).toLocaleTimeString(
                      undefined,
                      { hour: "2-digit", minute: "2-digit", hour12: false },
                    );
                    return (
                      <div
                        key={p.id}
                        className="rounded border-l-2 bg-white px-1.5 py-1"
                        style={{ borderColor: m.color }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="rounded px-1 py-0.5 text-[8px] font-semibold"
                            style={{ background: m.bg, color: m.text }}
                          >
                            {m.short}
                          </span>
                          <span className="font-mono text-[9px] text-muted">
                            {time}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-snug">
                          {p.title || p.caption.slice(0, 40) || "Post"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-6 flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted">
        <span>Generated by GiriFlow · {new Date().toLocaleDateString()}</span>
        <span>{posts.length} posts</span>
      </footer>
    </div>
  );
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
