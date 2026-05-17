"use client";

import { useState } from "react";

type View = "day" | "week" | "month" | "year";

type Post = {
  day: number; // 0 = Mon … 6 = Sun
  hour: string; // "09:00"
  channel: "ig" | "tt" | "li" | "yt" | "x" | "fb";
  title: string;
  status?: "draft" | "approved" | "scheduled";
  author?: string;
};

const channelMeta: Record<
  Post["channel"],
  { label: string; color: string; bg: string; text: string }
> = {
  ig: { label: "IG", color: "var(--c-instagram)", bg: "#fdf4ff", text: "#86198f" },
  tt: { label: "TT", color: "var(--c-tiktok)", bg: "#f0f9ff", text: "#0369a1" },
  li: { label: "LI", color: "var(--c-linkedin)", bg: "#eff6ff", text: "#1e40af" },
  yt: { label: "YT", color: "var(--c-youtube)", bg: "#fef2f2", text: "#991b1b" },
  x:  { label: "X",  color: "var(--c-x)",        bg: "#f1f5f9", text: "#0f172a" },
  fb: { label: "FB", color: "var(--c-facebook)", bg: "#eef4ff", text: "#1e3a8a" },
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const samplePosts: Post[] = [
  { day: 0, hour: "09:00", channel: "ig", title: "Monday motivation reel",   status: "approved",  author: "AY" },
  { day: 0, hour: "14:00", channel: "li", title: "Founder essay teaser",     status: "scheduled", author: "TM" },
  { day: 1, hour: "11:30", channel: "tt", title: "Behind the scenes",        status: "draft",     author: "AY" },
  { day: 2, hour: "08:00", channel: "x",  title: "Newsletter drop",          status: "scheduled", author: "RS" },
  { day: 2, hour: "17:00", channel: "ig", title: "Carousel: 5 tips",         status: "approved",  author: "AY" },
  { day: 3, hour: "10:00", channel: "yt", title: "Long-form launch",         status: "draft",     author: "TM" },
  { day: 4, hour: "12:30", channel: "fb", title: "Community thank-you",      status: "scheduled", author: "RS" },
  { day: 4, hour: "18:00", channel: "ig", title: "Reel: customer story",     status: "approved",  author: "AY" },
  { day: 5, hour: "10:00", channel: "tt", title: "Weekend skit",             status: "draft",     author: "AY" },
  { day: 6, hour: "16:00", channel: "li", title: "Recap of the week",        status: "draft",     author: "TM" },
];

export function CalendarPreview() {
  const [view, setView] = useState<View>("week");

  return (
    <div className="relative">
      {/* Soft brand glow behind the card */}
      <div
        className="absolute -inset-6 -z-10 rounded-[36px] blur-2xl opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 20%, rgba(30,163,86,.18), transparent 70%), radial-gradient(40% 50% at 80% 80%, rgba(109,213,149,.22), transparent 75%)",
        }}
        aria-hidden
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_60px_-30px_rgba(13,82,46,0.35)]">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border bg-subtle/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6058]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbe2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c941]" />
            <span className="ml-3 hidden font-mono text-[11px] text-muted sm:inline">
              giriflow.com/plan/spring-launch
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar initials="AY" tint="var(--brand-500)" />
            <Avatar initials="TM" tint="#d946ef" />
            <Avatar initials="RS" tint="#0ea5e9" />
            <span className="ml-1 rounded-full bg-brand-50 px-2 py-1 text-[10px] font-medium text-brand-700">
              3 online
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted">
              Spring launch
            </p>
            <p className="text-sm font-semibold">May 18 — May 24, 2026</p>
          </div>

          <div className="inline-flex rounded-full border border-border bg-subtle/50 p-1">
            {(["day", "week", "month", "year"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
                  view === v
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted hover:text-foreground",
                ].join(" ")}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="hidden items-center gap-2 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background sm:inline-flex"
          >
            <span aria-hidden>＋</span> New post
          </button>
        </div>

        {/* Body */}
        <div className="min-h-[340px] bg-background/50 p-4">
          {view === "week" && <WeekGrid />}
          {view === "month" && <MonthGrid />}
          {view === "day" && <DayList />}
          {view === "year" && <YearStrip />}
        </div>
      </div>
    </div>
  );
}

function Avatar({ initials, tint }: { initials: string; tint: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold text-white"
      style={{ background: tint }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function PostChip({ post }: { post: Post }) {
  const meta = channelMeta[post.channel];
  return (
    <div
      className="rounded-md border-l-2 bg-white/70 px-2 py-1.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
      style={{ borderColor: meta.color }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide"
          style={{ background: meta.bg, color: meta.text }}
        >
          {meta.label}
        </span>
        <span className="font-mono text-[10px] text-muted">{post.hour}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug text-foreground/90">
        {post.title}
      </p>
      {post.status && (
        <div className="mt-1 flex items-center gap-1">
          <span
            className={[
              "inline-block h-1.5 w-1.5 rounded-full",
              post.status === "approved"
                ? "bg-brand-500"
                : post.status === "scheduled"
                ? "bg-sky-500"
                : "bg-amber-400",
            ].join(" ")}
          />
          <span className="text-[9px] capitalize text-muted">{post.status}</span>
        </div>
      )}
    </div>
  );
}

function WeekGrid() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d, i) => {
        const dayPosts = samplePosts.filter((p) => p.day === i);
        const isToday = i === 2;
        return (
          <div
            key={d}
            className={[
              "flex min-h-[260px] flex-col gap-1.5 rounded-lg border bg-surface p-2",
              isToday ? "border-brand-300 ring-1 ring-brand-200" : "border-border",
            ].join(" ")}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                {d}
              </span>
              <span
                className={[
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                  isToday
                    ? "bg-brand-500 text-white"
                    : "text-foreground/70",
                ].join(" ")}
              >
                {18 + i}
              </span>
            </div>
            {dayPosts.map((p, idx) => (
              <PostChip key={idx} post={p} />
            ))}
            {dayPosts.length === 0 && (
              <button
                type="button"
                className="mt-1 rounded-md border border-dashed border-border-strong/70 px-2 py-2 text-[10px] text-muted hover:border-brand-300 hover:text-brand-700"
              >
                ＋ add
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MonthGrid() {
  const cells = Array.from({ length: 35 }, (_, i) => i + 1);
  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
        {days.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((n) => {
          const dots = ((n * 7) % 5);
          const isToday = n === 13;
          return (
            <div
              key={n}
              className={[
                "min-h-[58px] rounded-md border bg-surface p-1.5",
                isToday ? "border-brand-300 ring-1 ring-brand-200" : "border-border",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className={[
                  "text-[10px]",
                  isToday ? "font-semibold text-brand-700" : "text-foreground/70",
                ].join(" ")}>{n}</span>
                <span className="text-[9px] text-muted">{dots > 0 ? `${dots}` : ""}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-0.5">
                {Array.from({ length: dots }).map((_, i) => {
                  const palette = ["#d946ef", "#0ea5e9", "#1e40af", "#ef4444", "#1ea356"];
                  return (
                    <span
                      key={i}
                      className="h-1.5 w-4 rounded-full"
                      style={{ background: palette[(n + i) % palette.length] }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayList() {
  const posts = samplePosts.filter((p) => p.day === 2);
  return (
    <div className="mx-auto max-w-md space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        Wed, May 20 — 2 scheduled
      </p>
      {posts.map((p, i) => (
        <div key={i} className="flex items-stretch gap-3 rounded-lg border border-border bg-surface p-3">
          <div className="flex w-14 flex-col items-center justify-center rounded-md bg-subtle">
            <span className="font-mono text-xs font-semibold">{p.hour}</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-muted">WAT</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{ background: channelMeta[p.channel].bg, color: channelMeta[p.channel].text }}
              >
                {channelMeta[p.channel].label}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted">{p.status}</span>
            </div>
            <p className="mt-1 text-sm font-medium">{p.title}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex -space-x-1.5">
                <Avatar initials={p.author ?? "AY"} tint="var(--brand-500)" />
              </div>
              <span className="text-[10px] text-muted">2 comments · 1 approval</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function YearStrip() {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return (
    <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
      {months.map((m, i) => {
        const density = (i * 11) % 10;
        const isMay = m === "May";
        return (
          <div
            key={m}
            className={[
              "rounded-lg border bg-surface p-2",
              isMay ? "border-brand-300 ring-1 ring-brand-200" : "border-border",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/70">{m}</span>
              <span className="text-[10px] text-muted">{density}</span>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-[2px]">
              {Array.from({ length: 28 }).map((_, k) => {
                const intensity = (k * 13 + i) % 7;
                const shades = ["#eef3ee","#d0f4dd","#a4e7bd","#6dd595","#3cbe72","#1ea356","#0f6938"];
                return (
                  <span
                    key={k}
                    className="aspect-square rounded-[2px]"
                    style={{ background: shades[intensity] }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
