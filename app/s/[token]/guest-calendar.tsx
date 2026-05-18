"use client";

import { useEffect, useMemo, useState } from "react";
import { channelMeta, statusMeta } from "@/lib/channels";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { Post } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const GUEST_NAME_STORAGE_KEY = "giriflow_guest_name";

export type GuestLink = {
  id: string;
  name: string;
  allow_comments: boolean;
  expires_at: string | null;
};

export type GuestComment = {
  id: string;
  post_id: string;
  author_label: string | null;
  is_guest: boolean;
  body: string;
  created_at: string;
};

export function GuestCalendar({
  token,
  posts,
  comments: initialComments,
  link,
  initialYear,
  initialMonth0,
  workspaceName,
}: {
  token: string;
  posts: Post[];
  comments: GuestComment[];
  link: GuestLink;
  initialYear: number;
  initialMonth0: number;
  workspaceName: string;
}) {
  const [year, setYear] = useState(initialYear);
  const [month0, setMonth0] = useState(initialMonth0);
  const [open, setOpen] = useState<Post | null>(null);
  const [comments, setComments] = useState<GuestComment[]>(initialComments);

  const commentsByPost = useMemo(() => {
    const map = new Map<string, GuestComment[]>();
    for (const c of comments) {
      const arr = map.get(c.post_id) ?? [];
      arr.push(c);
      map.set(c.post_id, arr);
    }
    return map;
  }, [comments]);

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

  function appendComment(c: GuestComment) {
    setComments((arr) => [...arr, c]);
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
                  "min-h-[120px] border-b border-r border-border p-2",
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
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, 4).map((p) => {
                    const m = channelMeta[p.channel];
                    const cmts = commentsByPost.get(p.id)?.length ?? 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setOpen(p)}
                        className="block w-full rounded-md border-l-2 bg-white/70 px-2 py-1 text-left hover:-translate-y-0.5 hover:shadow-sm transition"
                        style={{ borderColor: m.color }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="rounded px-1 py-0.5 text-[9px] font-semibold"
                            style={{ background: m.bg, color: m.text }}
                          >
                            {m.short}
                          </span>
                          {cmts > 0 && (
                            <span className="text-[9px] text-muted">💬 {cmts}</span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[11px] font-medium">
                          {p.title || p.caption.slice(0, 30) || "Post"}
                        </p>
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

      {open && (
        <PostPreview
          token={token}
          post={open}
          link={link}
          comments={commentsByPost.get(open.id) ?? []}
          onClose={() => setOpen(null)}
          onCommentAdded={appendComment}
        />
      )}
    </div>
  );
}

function PostPreview({
  token,
  post,
  link,
  comments,
  onClose,
  onCommentAdded,
}: {
  token: string;
  post: Post;
  link: GuestLink;
  comments: GuestComment[];
  onClose: () => void;
  onCommentAdded: (c: GuestComment) => void;
}) {
  const m = channelMeta[post.channel];
  const s = statusMeta[post.status];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface">
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
            aria-label="Close"
            className="rounded-full p-1.5 text-muted hover:bg-subtle"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
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
                        <span className="truncate font-medium text-foreground/85">
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

          {/* Comments thread */}
          <div className="border-t border-border bg-subtle/20 p-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Comments {comments.length > 0 && `· ${comments.length}`}
            </p>
            {comments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border-strong/60 px-4 py-6 text-center text-xs text-muted">
                {link.allow_comments
                  ? "No comments yet. Be the first to weigh in."
                  : "No comments. The owner hasn't enabled comments on this link."}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {comments.map((c) => (
                  <CommentRow key={c.id} comment={c} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {link.allow_comments && (
          <GuestCommentForm
            token={token}
            postId={post.id}
            onAdded={onCommentAdded}
          />
        )}
      </div>
    </div>
  );
}

function CommentRow({ comment }: { comment: GuestComment }) {
  const initial = (comment.author_label?.[0] || "G").toUpperCase();
  return (
    <li className="flex gap-2.5 rounded-xl border border-border bg-surface p-3">
      <span
        className={[
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-background",
          comment.is_guest ? "bg-brand-500" : "bg-foreground",
        ].join(" ")}
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold">
            {comment.author_label || "Team"}
          </p>
          {comment.is_guest && (
            <span className="rounded-full bg-subtle px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted">
              guest
            </span>
          )}
          <span className="text-[10px] text-muted">
            {new Date(comment.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/85">
          {comment.body}
        </p>
      </div>
    </li>
  );
}

function GuestCommentForm({
  token,
  postId,
  onAdded,
}: {
  token: string;
  postId: string;
  onAdded: (c: GuestComment) => void;
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [hasSavedName, setHasSavedName] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load remembered guest name once on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(GUEST_NAME_STORAGE_KEY);
      if (saved) {
        setName(saved);
        setHasSavedName(true);
      }
    } catch {
      // localStorage can be blocked in private mode — ignore.
    }
  }, []);

  function rememberName(value: string) {
    try {
      window.localStorage.setItem(GUEST_NAME_STORAGE_KEY, value);
      setHasSavedName(true);
    } catch {
      // ignore
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedBody = body.trim();
    if (!trimmedName) {
      setError("Please add your name first.");
      return;
    }
    if (!trimmedBody) return;

    setBusy(true);
    setError(null);
    try {
      const supabase = getBrowserClient();
      const { data, error: rpcError } = await supabase.rpc("add_guest_comment", {
        p_token: token,
        p_post_id: postId,
        p_name: trimmedName,
        p_body: trimmedBody,
      });
      if (rpcError) throw new Error(rpcError.message);
      const created = data as GuestComment;
      onAdded(created);
      rememberName(trimmedName);
      setEditingName(false);
      setBody("");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  // Step 1: ask for a name if we don't have one yet.
  if (!hasSavedName && !editingName) {
    return (
      <div className="border-t border-border bg-subtle/40 p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Comment as a guest
        </p>
        <p className="mb-2 text-xs text-foreground/70">
          Type your name once — we'll remember you on this device.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = name.trim();
            if (!v) {
              setError("Please enter your name.");
              return;
            }
            rememberName(v);
            setName(v);
            setEditingName(false);
            setError(null);
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Tola at Acme"
            maxLength={80}
            className="h-10 min-w-[200px] flex-1 rounded-full border border-border bg-surface px-4 text-sm placeholder:text-muted focus:border-brand-400"
            autoFocus
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-brand-700"
          >
            Continue
          </button>
        </form>
        {error && (
          <p role="alert" className="mt-1.5 text-[11px] text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Step 2: name on file — show the comment composer.
  return (
    <form
      onSubmit={submit}
      className="border-t border-border bg-subtle/40 p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span>
          Commenting as <strong className="text-foreground/85">{name}</strong>
        </span>
        <button
          type="button"
          onClick={() => {
            setEditingName(true);
            setHasSavedName(false);
          }}
          className="text-foreground/60 underline hover:text-brand-700"
        >
          Change name
        </button>
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={4000}
          placeholder="Add a comment for the team…"
          className="flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-brand-400"
        />
        <button
          type="submit"
          disabled={busy || !body.trim()}
          className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Sending…" : "Post"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

function friendlyError(err: unknown): string {
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Something went wrong";
  if (message.includes("link_expired")) return "This share link has expired.";
  if (message.includes("comments_not_allowed"))
    return "The owner has turned off comments on this link.";
  if (message.includes("invalid_token")) return "This share link is no longer valid.";
  if (message.includes("name_required")) return "Please enter your name.";
  if (message.includes("body_required")) return "Comment can't be empty.";
  return message;
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
