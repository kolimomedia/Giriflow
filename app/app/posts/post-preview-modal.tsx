"use client";

import { useEffect, useState } from "react";
import { channelMeta, statusMeta } from "@/lib/channels";
import type { EnrichedPost, PostComment } from "@/lib/types";
import { listComments } from "@/app/app/calendar/actions";

type Props = {
  post: EnrichedPost;
  onClose: () => void;
  onEdit: () => void;
};

export function PostPreviewModal({ post, onClose, onEdit }: Props) {
  const m = channelMeta[post.channel];
  const s = statusMeta[post.status];
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    setComments(null);
    setLoadError(null);
    listComments(post.id)
      .then((data) => {
        if (!cancelled) setComments((data ?? []) as PostComment[]);
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : "Could not load comments");
      });
    return () => {
      cancelled = true;
    };
  }, [post.id]);

  const scheduled = new Date(post.scheduled_at);
  const refs = post.reference_links ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_60px_-20px_rgba(14,47,100,0.5)]">
        {/* Header band — channel-tinted, mirrors the card */}
        <div
          className="relative px-5 py-5"
          style={{ background: `linear-gradient(135deg, ${m.color}1a, ${m.color}05 70%)` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
                style={{ background: m.bg, color: m.text }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
                {m.label}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ background: `${s.dot}1a`, color: s.dot }}
              >
                <span className="inline-block h-1 w-1 rounded-full" style={{ background: s.dot }} />
                {s.label}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-full p-1.5 text-foreground/70 hover:bg-surface/80 hover:text-foreground"
            >
              <CloseIcon />
            </button>
          </div>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted">
            Scheduled for
          </p>
          <p className="mt-0.5 text-base font-semibold tracking-tight text-foreground">
            {scheduled.toLocaleString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-6">
            {post.title && (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Title
                </p>
                <h3 className="text-lg font-semibold leading-snug">{post.title}</h3>
              </div>
            )}

            {post.caption && (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Caption
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {post.caption}
                </p>
              </div>
            )}

            {refs.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  References
                </p>
                <ul className="space-y-1.5">
                  {refs.map((link, idx) => (
                    <li key={`${link.url}-${idx}`}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-border bg-subtle/40 px-3 py-2 text-xs hover:border-brand-300"
                      >
                        <span aria-hidden>🔗</span>
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

            {/* Read-only comments */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                Comments{" "}
                {comments && comments.length > 0 && `· ${comments.length}`}
              </p>
              {loadError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {loadError}
                </p>
              ) : comments === null ? (
                <p className="text-xs text-muted">Loading comments…</p>
              ) : comments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border-strong/60 px-3 py-4 text-center text-xs text-muted">
                  No comments yet. Open the editor to add one.
                </p>
              ) : (
                <ul className="space-y-2">
                  {comments.map((c) => (
                    <CommentRow key={c.id} comment={c} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-subtle/40 px-6 py-3">
          <p className="text-[11px] text-muted">Read-only preview.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-medium text-foreground/70 hover:text-foreground"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition hover:bg-brand-700"
            >
              <PencilIcon />
              Edit post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentRow({ comment }: { comment: PostComment }) {
  const isGuest = !comment.author_id;
  const initial = (comment.author_label?.[0] || "Y").toUpperCase();
  return (
    <li className="flex gap-2.5 rounded-xl border border-border bg-surface p-3">
      <span
        className={[
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-background",
          isGuest ? "bg-brand-500" : "bg-foreground",
        ].join(" ")}
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold">
            {comment.author_label || "You"}
          </p>
          {isGuest && (
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
