"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { channelMeta, statusMeta } from "@/lib/channels";
import type { Post, Workspace } from "@/lib/types";
import { PostFormModal } from "@/components/app/post-form-modal";
import { createPost, deletePost, updatePost } from "./actions";

type View = "month" | "week";

type Props = {
  workspace: Workspace;
  initialPosts: Post[];
  initialYear: number;
  initialMonth0: number; // 0-indexed
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarApp({ workspace, initialPosts, initialYear, initialMonth0 }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [view, setView] = useState<View>("month");
  const [year, setYear] = useState(initialYear);
  const [month0, setMonth0] = useState(initialMonth0);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [pending, startTransition] = useTransition();

  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState<{ at: Date } | null>(null);

  function goMonth(delta: number) {
    let m = month0 + delta;
    let y = year;
    while (m < 0) { m += 12; y -= 1; }
    while (m > 11) { m -= 12; y += 1; }
    setMonth0(m);
    setYear(y);
    startTransition(() => {
      router.replace(`/app/calendar?month=${y}-${String(m + 1).padStart(2, "0")}`);
    });
  }

  function goWeek(delta: number) {
    setWeekStart((d) => {
      const next = new Date(d);
      next.setUTCDate(next.getUTCDate() + delta * 7);
      return next;
    });
  }

  function goToday() {
    const t = new Date();
    setYear(t.getUTCFullYear());
    setMonth0(t.getUTCMonth());
    setWeekStart(startOfWeek(t));
  }

  async function handleSave(form: {
    id?: string;
    channel: string;
    title: string;
    caption: string;
    scheduled_at: string;
    status: string;
  }) {
    const payload = { ...form, workspace_id: workspace.id };
    if (form.id) {
      const updated = await updatePost({ ...payload, id: form.id });
      setPosts((p) => p.map((x) => (x.id === form.id ? (updated as Post) : x)));
    } else {
      const created = await createPost(payload);
      setPosts((p) => [...p, created as Post]);
    }
    setEditing(null);
    setCreating(null);
  }

  async function handleDelete(id: string) {
    await deletePost(id);
    setPosts((p) => p.filter((x) => x.id !== id));
    setEditing(null);
  }

  const headerLabel = useMemo(() => {
    if (view === "month") return `${MONTH_NAMES[month0]} ${year}`;
    const end = new Date(weekStart);
    end.setUTCDate(end.getUTCDate() + 6);
    return `${formatRange(weekStart, end)}`;
  }, [view, month0, year, weekStart]);

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">{headerLabel}</h1>
          <div className="inline-flex items-center rounded-full border border-border bg-subtle/50 p-0.5">
            <button
              type="button"
              onClick={view === "month" ? () => goMonth(-1) : () => goWeek(-1)}
              className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-foreground"
              aria-label="Previous"
            >
              <ChevronIcon dir="left" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-3 text-xs font-medium text-foreground"
            >
              Today
            </button>
            <button
              type="button"
              onClick={view === "month" ? () => goMonth(1) : () => goWeek(1)}
              className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-foreground"
              aria-label="Next"
            >
              <ChevronIcon dir="right" />
            </button>
          </div>
          {pending && <span className="text-xs text-muted">…</span>}
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-border bg-subtle/50 p-1">
            {(["month", "week"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
                  view === v ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground",
                ].join(" ")}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCreating({ at: combineDateAndTime(new Date(), "10:00") })}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-medium text-background hover:bg-brand-700"
          >
            <span aria-hidden>＋</span> New post
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        {view === "month" ? (
          <MonthView
            year={year}
            month0={month0}
            posts={posts}
            onCellClick={(d) => setCreating({ at: combineDateAndTime(d, "10:00") })}
            onPostClick={setEditing}
          />
        ) : (
          <WeekView
            weekStart={weekStart}
            posts={posts}
            onCellClick={(d) => setCreating({ at: d })}
            onPostClick={setEditing}
          />
        )}
      </div>

      {(creating || editing) && (
        <PostFormModal
          initial={editing ?? undefined}
          defaultScheduledAt={creating?.at}
          onClose={() => {
            setEditing(null);
            setCreating(null);
          }}
          onSave={handleSave}
          onDelete={editing ? () => handleDelete(editing.id) : undefined}
        />
      )}
    </div>
  );
}

/* ── Month view ───────────────────────────────────────────────────────── */

function MonthView({
  year,
  month0,
  posts,
  onCellClick,
  onPostClick,
}: {
  year: number;
  month0: number;
  posts: Post[];
  onCellClick: (d: Date) => void;
  onPostClick: (p: Post) => void;
}) {
  const cells = buildMonthCells(year, month0);
  const today = new Date();
  const todayKey = ymd(today);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid grid-cols-7 border-b border-border bg-subtle/50">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted"
          >
            {d}
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
                "group relative min-h-[120px] border-b border-r border-border p-2",
                inMonth ? "bg-surface" : "bg-subtle/30",
                (i + 1) % 7 === 0 ? "border-r-0" : "",
              ].join(" ")}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={[
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                    isToday ? "bg-brand-500 text-white" : inMonth ? "text-foreground/70" : "text-muted",
                  ].join(" ")}
                >
                  {c.date.getUTCDate()}
                </span>
                <button
                  type="button"
                  onClick={() => onCellClick(c.date)}
                  className="rounded-full p-1 text-muted opacity-0 transition group-hover:opacity-100 hover:bg-brand-50 hover:text-brand-700"
                  aria-label={`Add post on ${ymd(c.date)}`}
                >
                  <PlusIcon />
                </button>
              </div>
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((p) => (
                  <PostChip key={p.id} post={p} onClick={() => onPostClick(p)} compact />
                ))}
                {dayPosts.length > 3 && (
                  <p className="px-1 text-[10px] text-muted">
                    +{dayPosts.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Week view ─────────────────────────────────────────────────────────── */

function WeekView({
  weekStart,
  posts,
  onCellClick,
  onPostClick,
}: {
  weekStart: Date;
  posts: Post[];
  onCellClick: (d: Date) => void;
  onPostClick: (p: Post) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    return d;
  });
  const todayKey = ymd(new Date());

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const dayPosts = postsOn(posts, d);
        const isToday = ymd(d) === todayKey;
        return (
          <div
            key={d.toISOString()}
            className={[
              "flex min-h-[420px] flex-col rounded-2xl border bg-surface p-2",
              isToday ? "border-brand-300 ring-1 ring-brand-200" : "border-border",
            ].join(" ")}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {d.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" })}
                </p>
                <p
                  className={[
                    "text-base font-semibold",
                    isToday ? "text-brand-700" : "text-foreground",
                  ].join(" ")}
                >
                  {d.getUTCDate()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onCellClick(combineDateAndTime(d, "10:00"))}
                className="rounded-full p-1.5 text-muted hover:bg-brand-50 hover:text-brand-700"
                aria-label="Add"
              >
                <PlusIcon />
              </button>
            </div>
            <div className="flex-1 space-y-2">
              {dayPosts.map((p) => (
                <PostChip key={p.id} post={p} onClick={() => onPostClick(p)} />
              ))}
              {dayPosts.length === 0 && (
                <button
                  type="button"
                  onClick={() => onCellClick(combineDateAndTime(d, "10:00"))}
                  className="mt-2 w-full rounded-lg border border-dashed border-border-strong/70 px-3 py-3 text-xs text-muted hover:border-brand-300 hover:text-brand-700"
                >
                  ＋ Add post
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Post chip ─────────────────────────────────────────────────────────── */

function PostChip({
  post,
  onClick,
  compact = false,
}: {
  post: Post;
  onClick: () => void;
  compact?: boolean;
}) {
  const meta = channelMeta[post.channel];
  const status = statusMeta[post.status];
  const time = new Date(post.scheduled_at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md border-l-2 bg-white/70 px-2 py-1.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
      style={{ borderColor: meta.color }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide"
          style={{ background: meta.bg, color: meta.text }}
        >
          {meta.short}
        </span>
        <span className="font-mono text-[10px] text-muted">{time}</span>
      </div>
      <p className={`${compact ? "line-clamp-1" : "line-clamp-2"} mt-1 text-[11px] font-medium leading-snug text-foreground/90`}>
        {post.title || post.caption || "Untitled post"}
      </p>
      {!compact && (
        <div className="mt-1 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
          <span className="text-[9px] capitalize text-muted">{status.label.toLowerCase()}</span>
        </div>
      )}
    </button>
  );
}

/* ── helpers ───────────────────────────────────────────────────────────── */

function startOfWeek(d: Date): Date {
  const out = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = out.getUTCDay(); // 0 = Sun
  const diff = (day + 6) % 7; // Mon as start
  out.setUTCDate(out.getUTCDate() - diff);
  return out;
}

function buildMonthCells(year: number, month0: number): { date: Date }[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const start = startOfWeek(first);
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

function combineDateAndTime(d: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const out = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m, 0));
  return out;
}

function formatRange(a: Date, b: Date): string {
  const sameMonth = a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
  const mA = a.toLocaleDateString(undefined, { month: "short", timeZone: "UTC" });
  const mB = b.toLocaleDateString(undefined, { month: "short", timeZone: "UTC" });
  if (sameMonth) return `${mA} ${a.getUTCDate()}–${b.getUTCDate()}, ${a.getUTCFullYear()}`;
  return `${mA} ${a.getUTCDate()} – ${mB} ${b.getUTCDate()}, ${a.getUTCFullYear()}`;
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
