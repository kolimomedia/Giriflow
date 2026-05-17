"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { channelMeta, statusMeta } from "@/lib/channels";
import type { Post, Workspace } from "@/lib/types";
import { PostFormModal } from "@/components/app/post-form-modal";
import {
  approvePost,
  createPost,
  deletePost,
  reschedulePost,
  updatePost,
} from "./actions";

type View = "day" | "week" | "month" | "year";

type Props = {
  workspace: Workspace;
  initialPosts: Post[];
  initialYear: number;
  initialMonth0: number;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarApp({
  workspace,
  initialPosts,
  initialYear,
  initialMonth0,
}: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [view, setView] = useState<View>("month");
  const [year, setYear] = useState(initialYear);
  const [month0, setMonth0] = useState(initialMonth0);
  const [activeDay, setActiveDay] = useState<Date>(() => startOfDay(new Date()));
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [pending, startTransition] = useTransition();

  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState<{ at: Date } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function navigate(delta: number) {
    if (view === "day") {
      const next = new Date(activeDay);
      next.setUTCDate(next.getUTCDate() + delta);
      setActiveDay(next);
    } else if (view === "week") {
      setWeekStart((d) => {
        const next = new Date(d);
        next.setUTCDate(next.getUTCDate() + delta * 7);
        return next;
      });
    } else if (view === "month") {
      let m = month0 + delta;
      let y = year;
      while (m < 0) { m += 12; y -= 1; }
      while (m > 11) { m -= 12; y += 1; }
      setMonth0(m);
      setYear(y);
      startTransition(() => {
        router.replace(
          `/app/calendar?month=${y}-${String(m + 1).padStart(2, "0")}`,
        );
      });
    } else if (view === "year") {
      const y = year + delta;
      setYear(y);
      startTransition(() => {
        router.replace(`/app/calendar?month=${y}-01`);
      });
    }
  }

  function goToday() {
    const t = new Date();
    setYear(t.getUTCFullYear());
    setMonth0(t.getUTCMonth());
    setActiveDay(startOfDay(t));
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

  async function handleApprove(id: string) {
    const updated = await approvePost(id);
    setPosts((p) => p.map((x) => (x.id === id ? (updated as Post) : x)));
    if (editing?.id === id) setEditing(updated as Post);
  }

  async function handleDrop(targetDate: Date, postId: string) {
    const ymdStr = ymd(targetDate);
    // Optimistic update: move the post's time-of-day to the new date.
    setPosts((p) =>
      p.map((x) => {
        if (x.id !== postId) return x;
        const t = new Date(x.scheduled_at);
        const next = new Date(
          Date.UTC(
            targetDate.getUTCFullYear(),
            targetDate.getUTCMonth(),
            targetDate.getUTCDate(),
            t.getUTCHours(),
            t.getUTCMinutes(),
            0,
          ),
        );
        return { ...x, scheduled_at: next.toISOString() };
      }),
    );
    try {
      await reschedulePost(postId, ymdStr);
    } catch {
      // Roll back on error by refetching — simplest.
      router.refresh();
    }
  }

  const headerLabel = useMemo(() => {
    if (view === "day") {
      return activeDay.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }
    if (view === "month") return `${MONTH_NAMES[month0]} ${year}`;
    if (view === "year") return `${year}`;
    const end = new Date(weekStart);
    end.setUTCDate(end.getUTCDate() + 6);
    return formatRange(weekStart, end);
  }, [view, activeDay, month0, year, weekStart]);

  function openPrint() {
    const y = view === "year" ? year : year;
    const m = view === "year" ? 0 : month0;
    window.open(
      `/app/calendar/print?month=${y}-${String(m + 1).padStart(2, "0")}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">{headerLabel}</h1>
          <div className="inline-flex items-center rounded-full border border-border bg-subtle/50 p-0.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
              onClick={() => navigate(1)}
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
            onClick={openPrint}
            title="Print or save as PDF"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-foreground/85 hover:border-brand-300 hover:text-brand-700"
          >
            <PdfIcon />
            Export PDF
          </button>
          <button
            type="button"
            onClick={() => setCreating({ at: combineDateAndTime(new Date(), "10:00") })}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-xs font-medium text-background hover:bg-brand-700"
          >
            <span aria-hidden>＋</span> New post
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4">
        {view === "day" && (
          <DayView
            day={activeDay}
            posts={posts}
            onCellClick={(d) => setCreating({ at: d })}
            onPostClick={setEditing}
          />
        )}
        {view === "week" && (
          <WeekView
            weekStart={weekStart}
            posts={posts}
            onCellClick={(d) => setCreating({ at: d })}
            onPostClick={setEditing}
            onDrop={handleDrop}
            draggingId={draggingId}
            setDraggingId={setDraggingId}
          />
        )}
        {view === "month" && (
          <MonthView
            year={year}
            month0={month0}
            posts={posts}
            onCellClick={(d) => setCreating({ at: combineDateAndTime(d, "10:00") })}
            onPostClick={setEditing}
            onDrop={handleDrop}
            draggingId={draggingId}
            setDraggingId={setDraggingId}
          />
        )}
        {view === "year" && (
          <YearView
            year={year}
            posts={posts}
            onPickMonth={(m) => {
              setMonth0(m);
              setView("month");
              startTransition(() => {
                router.replace(
                  `/app/calendar?month=${year}-${String(m + 1).padStart(2, "0")}`,
                );
              });
            }}
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
          onApprove={
            editing && editing.status !== "approved"
              ? () => handleApprove(editing.id)
              : undefined
          }
        />
      )}
    </div>
  );
}

/* ── Day view ─────────────────────────────────────────────────────────── */

function DayView({
  day,
  posts,
  onCellClick,
  onPostClick,
}: {
  day: Date;
  posts: Post[];
  onCellClick: (d: Date) => void;
  onPostClick: (p: Post) => void;
}) {
  const dayPosts = postsOn(posts, day);
  // 18 hourly slots from 6am → midnight to cover most posting windows.
  const slots = Array.from({ length: 18 }, (_, i) => i + 6);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border bg-surface">
        {slots.map((hour) => {
          const slotStart = combineDateAndTime(day, `${String(hour).padStart(2, "0")}:00`);
          const slotPosts = dayPosts.filter(
            (p) => new Date(p.scheduled_at).getUTCHours() === hour,
          );
          return (
            <div
              key={hour}
              className="grid grid-cols-[64px_1fr] border-b border-border last:border-b-0"
            >
              <button
                type="button"
                onClick={() => onCellClick(slotStart)}
                className="border-r border-border bg-subtle/30 px-3 py-3 text-left font-mono text-[11px] text-muted hover:bg-subtle"
              >
                {String(hour).padStart(2, "0")}:00
              </button>
              <div className="flex flex-wrap gap-2 p-2">
                {slotPosts.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onCellClick(slotStart)}
                    className="w-full rounded-md border border-dashed border-border-strong/40 px-3 py-3 text-left text-[11px] text-muted hover:border-brand-300 hover:text-brand-700"
                  >
                    ＋ add post
                  </button>
                ) : (
                  slotPosts.map((p) => (
                    <PostChip key={p.id} post={p} onClick={() => onPostClick(p)} expanded />
                  ))
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
  onDrop,
  draggingId,
  setDraggingId,
}: {
  weekStart: Date;
  posts: Post[];
  onCellClick: (d: Date) => void;
  onPostClick: (p: Post) => void;
  onDrop: (date: Date, postId: string) => void;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
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
          <DropCell
            key={d.toISOString()}
            date={d}
            onDrop={onDrop}
            draggingId={draggingId}
            className={[
              "flex min-h-[420px] flex-col rounded-2xl border bg-surface p-2",
              isToday ? "border-brand-300 ring-1 ring-brand-200" : "border-border",
            ].join(" ")}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {d.toLocaleDateString(undefined, {
                    weekday: "short",
                    timeZone: "UTC",
                  })}
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
                <PostChip
                  key={p.id}
                  post={p}
                  onClick={() => onPostClick(p)}
                  draggable
                  onDragStart={() => setDraggingId(p.id)}
                  onDragEnd={() => setDraggingId(null)}
                />
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
          </DropCell>
        );
      })}
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
  onDrop,
  draggingId,
  setDraggingId,
}: {
  year: number;
  month0: number;
  posts: Post[];
  onCellClick: (d: Date) => void;
  onPostClick: (p: Post) => void;
  onDrop: (date: Date, postId: string) => void;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
}) {
  const cells = buildMonthCells(year, month0);
  const todayKey = ymd(new Date());

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid grid-cols-7 border-b border-border bg-subtle/50">
        {DAYS.map((d) => (
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
            <DropCell
              key={i}
              date={c.date}
              onDrop={onDrop}
              draggingId={draggingId}
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
                    isToday
                      ? "bg-brand-500 text-white"
                      : inMonth
                        ? "text-foreground/70"
                        : "text-muted",
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
                  <PostChip
                    key={p.id}
                    post={p}
                    onClick={() => onPostClick(p)}
                    compact
                    draggable
                    onDragStart={() => setDraggingId(p.id)}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))}
                {dayPosts.length > 3 && (
                  <p className="px-1 text-[10px] text-muted">
                    +{dayPosts.length - 3} more
                  </p>
                )}
              </div>
            </DropCell>
          );
        })}
      </div>
    </div>
  );
}

/* ── Year view (heatmap) ──────────────────────────────────────────────── */

function YearView({
  year,
  posts,
  onPickMonth,
}: {
  year: number;
  posts: Post[];
  onPickMonth: (m: number) => void;
}) {
  // Count posts per day across the whole year.
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      const k = p.scheduled_at.slice(0, 10);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [posts]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {MONTH_NAMES.map((name, m) => {
        const cells = buildMonthCells(year, m);
        const monthCount = cells.reduce((sum, c) => {
          if (c.date.getUTCMonth() !== m) return sum;
          return sum + (counts.get(ymd(c.date)) ?? 0);
        }, 0);
        return (
          <button
            key={name}
            type="button"
            onClick={() => onPickMonth(m)}
            className="group rounded-2xl border border-border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_20px_40px_-25px_rgba(14,47,100,0.4)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold tracking-tight">{name}</p>
              <span className="rounded-full bg-subtle/60 px-2 py-0.5 font-mono text-[10px] text-muted">
                {monthCount}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted">
              {DAYS.map((d) => (
                <div key={d} className="text-center">{d.slice(0, 1)}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-0.5">
              {cells.map((c, i) => {
                const inMonth = c.date.getUTCMonth() === m;
                const count = inMonth ? counts.get(ymd(c.date)) ?? 0 : 0;
                const shade = heatShade(count);
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-[2px]"
                    style={{ background: inMonth ? shade : "transparent" }}
                    title={inMonth ? `${ymd(c.date)} — ${count} posts` : undefined}
                  />
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function heatShade(count: number): string {
  // Brand-tinted heatmap.
  if (count === 0) return "#eef3fb";
  if (count === 1) return "#d6e9ff";
  if (count === 2) return "#afd1ff";
  if (count === 3) return "#7eb3ff";
  if (count === 4) return "#4a91ff";
  if (count <= 6) return "#1f74f1";
  return "#114aa9";
}

/* ── Shared bits ──────────────────────────────────────────────────────── */

function PostChip({
  post,
  onClick,
  compact = false,
  expanded = false,
  draggable,
  onDragStart,
  onDragEnd,
}: {
  post: Post;
  onClick: () => void;
  compact?: boolean;
  expanded?: boolean;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
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
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", post.id);
        onDragStart?.();
      }}
      onDragEnd={() => onDragEnd?.()}
      className={[
        "w-full rounded-md border-l-2 bg-white/70 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
        expanded ? "px-3 py-2" : "px-2 py-1.5",
        draggable ? "cursor-grab active:cursor-grabbing" : "",
      ].join(" ")}
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
      <p
        className={[
          "mt-1 font-medium leading-snug text-foreground/90",
          expanded ? "text-sm" : compact ? "line-clamp-1 text-[11px]" : "line-clamp-2 text-[11px]",
        ].join(" ")}
      >
        {post.title || post.caption || "Untitled post"}
      </p>
      {!compact && (
        <div className="mt-1 flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: status.dot }}
          />
          <span className="text-[9px] capitalize text-muted">
            {status.label.toLowerCase()}
          </span>
        </div>
      )}
    </button>
  );
}

function DropCell({
  date,
  onDrop,
  draggingId,
  className,
  children,
}: {
  date: Date;
  onDrop: (date: Date, postId: string) => void;
  draggingId: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={[
        className ?? "",
        over && draggingId ? "outline outline-2 outline-brand-300 -outline-offset-2" : "",
      ].join(" ")}
      onDragOver={(e) => {
        if (!draggingId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!over) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(date, id);
      }}
    >
      {children}
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function startOfWeek(d: Date): Date {
  const out = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = out.getUTCDay();
  const diff = (day + 6) % 7;
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
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m, 0));
}

function formatRange(a: Date, b: Date): string {
  const sameMonth =
    a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
  const mA = a.toLocaleDateString(undefined, { month: "short", timeZone: "UTC" });
  const mB = b.toLocaleDateString(undefined, { month: "short", timeZone: "UTC" });
  if (sameMonth) return `${mA} ${a.getUTCDate()}–${b.getUTCDate()}, ${a.getUTCFullYear()}`;
  return `${mA} ${a.getUTCDate()} – ${mB} ${b.getUTCDate()}, ${a.getUTCFullYear()}`;
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
