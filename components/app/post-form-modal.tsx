"use client";

import { useEffect, useState } from "react";
import { channelMeta, channelIds, statusIds, statusMeta } from "@/lib/channels";
import type { Post, PostComment, ReferenceLink } from "@/lib/types";
import { createComment, deleteComment, listComments } from "@/app/app/calendar/actions";

type Props = {
  initial?: Post;
  defaultScheduledAt?: Date;
  onClose: () => void;
  onSave: (form: {
    id?: string;
    channel: string;
    title: string;
    caption: string;
    scheduled_at: string;
    status: string;
    reference_links: ReferenceLink[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onApprove?: () => Promise<void>;
};

type Tab = "edit" | "comments";

export function PostFormModal({
  initial,
  defaultScheduledAt,
  onClose,
  onSave,
  onDelete,
  onApprove,
}: Props) {
  const [tab, setTab] = useState<Tab>("edit");
  const [channel, setChannel] = useState<string>(initial?.channel ?? "instagram");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [status, setStatus] = useState<string>(initial?.status ?? "draft");
  const [scheduledLocal, setScheduledLocal] = useState(() => {
    const d = initial
      ? new Date(initial.scheduled_at)
      : (defaultScheduledAt ?? new Date());
    return toLocalInput(d);
  });
  const [links, setLinks] = useState<ReferenceLink[]>(
    initial?.reference_links ?? [],
  );
  const [busy, setBusy] = useState<"" | "save" | "delete" | "approve">("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    setError(null);
    try {
      const scheduled_at = new Date(scheduledLocal).toISOString();
      await onSave({
        id: initial?.id,
        channel,
        title,
        caption,
        scheduled_at,
        status,
        reference_links: links,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy("");
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusy("delete");
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy("");
    }
  }

  async function handleApprove() {
    if (!onApprove) return;
    setBusy("approve");
    try {
      await onApprove();
      setStatus("approved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_60px_-20px_rgba(14,47,100,0.5)]">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold tracking-tight">
              {initial ? "Edit post" : "New post"}
            </h2>
            {initial && (
              <div className="inline-flex rounded-full border border-border bg-subtle/50 p-0.5">
                {(["edit", "comments"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-medium capitalize transition",
                      tab === t
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-subtle hover:text-foreground"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {tab === "edit" ? (
          <form onSubmit={handleSave}>
            <div className="space-y-4 p-6">
              <Field label="Channel">
                <div className="flex flex-wrap gap-1.5">
                  {channelIds.map((c) => {
                    const m = channelMeta[c];
                    const active = channel === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setChannel(c)}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                          active
                            ? "border-transparent text-white"
                            : "border-border bg-surface text-foreground/75 hover:border-brand-300",
                        ].join(" ")}
                        style={active ? { background: m.color } : {}}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: active ? "#fff" : m.color }}
                        />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Title">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's this post about?"
                  maxLength={200}
                  className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm placeholder:text-muted focus:border-brand-400"
                />
              </Field>

              <Field label="Caption">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  maxLength={5000}
                  placeholder="Write the caption your audience will see…"
                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted focus:border-brand-400"
                />
                <div className="mt-1 text-right text-[10px] text-muted">
                  {caption.length}/5000
                </div>
              </Field>

              <Field label="Reference links (optional)">
                <ReferenceLinksEditor value={links} onChange={setLinks} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Scheduled for">
                  <input
                    type="datetime-local"
                    value={scheduledLocal}
                    onChange={(e) => setScheduledLocal(e.target.value)}
                    required
                    className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm focus:border-brand-400"
                  />
                </Field>

                <Field label="Status">
                  <div className="flex gap-1">
                    {statusIds.map((s) => {
                      const active = status === s;
                      const m = statusMeta[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={[
                            "flex-1 rounded-lg border px-2 py-2 text-[11px] font-medium transition",
                            active
                              ? "border-brand-500 bg-brand-50 text-brand-800"
                              : "border-border text-foreground/70 hover:border-brand-300",
                          ].join(" ")}
                        >
                          <span
                            className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
                            style={{ background: m.dot }}
                          />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-subtle/40 px-6 py-3">
              <div className="flex gap-2">
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy === "delete"}
                    className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                  >
                    {busy === "delete" ? "Deleting…" : "Delete"}
                  </button>
                )}
                {onApprove && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={busy === "approve"}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-500 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100 disabled:opacity-60"
                  >
                    <CheckIcon />
                    {busy === "approve" ? "Approving…" : "Approve"}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2 text-xs font-medium text-foreground/70 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy === "save"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-brand-700 disabled:opacity-60"
                >
                  {busy === "save"
                    ? "Saving…"
                    : initial
                      ? "Save changes"
                      : "Create post"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          initial && <CommentsPanel post={initial} />
        )}
      </div>
    </div>
  );
}

function CommentsPanel({ post }: { post: Post }) {
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listComments(post.id)
      .then((data) => {
        if (!cancelled) setComments((data ?? []) as PostComment[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      });
    return () => {
      cancelled = true;
    };
  }, [post.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = (await createComment(post.id, body)) as PostComment;
      setComments((c) => [...(c ?? []), created]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(id);
      setComments((c) => (c ?? []).filter((x) => x.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const refs = post.reference_links ?? [];

  return (
    <div className="flex max-h-[60vh] flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {refs.length > 0 && (
          <div className="mb-5 rounded-xl border border-border bg-subtle/40 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
              References for this post
            </p>
            <ul className="space-y-1">
              {refs.map((link, idx) => (
                <li key={`${link.url}-${idx}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs hover:border-brand-300"
                  >
                    <span aria-hidden>🔗</span>
                    <span className="truncate font-medium text-foreground/85">
                      {link.label || hostname(link.url)}
                    </span>
                    {link.label && (
                      <span className="truncate font-mono text-[10px] text-muted">
                        · {hostname(link.url)}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {comments === null ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : comments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong/60 px-4 py-8 text-center text-sm text-muted">
            No comments yet. Be the first to say something.
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.id}
                className="group flex gap-2.5 rounded-xl border border-border bg-surface p-3"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {(c.author_label?.[0] || "Y").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">
                      {c.author_label || "You"}
                    </p>
                    <span className="text-[10px] text-muted">
                      {new Date(c.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      className="ml-auto text-[10px] text-muted opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                    >
                      delete
                    </button>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/85">
                    {c.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form
        onSubmit={submit}
        className="flex items-end gap-2 border-t border-border bg-subtle/40 p-4"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={4000}
          placeholder="Add a comment…"
          className="flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-brand-400"
        />
        <button
          type="submit"
          disabled={busy || !body.trim()}
          className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Sending…" : "Post"}
        </button>
      </form>
      {error && (
        <p className="border-t border-border bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function ReferenceLinksEditor({
  value,
  onChange,
}: {
  value: ReferenceLink[];
  onChange: (next: ReferenceLink[]) => void;
}) {
  const [draftUrl, setDraftUrl] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const MAX_LINKS = 20;

  function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const url = normalizeUrl(draftUrl);
    if (!url) {
      setError("Enter a valid http(s) URL.");
      return;
    }
    if (value.length >= MAX_LINKS) {
      setError(`Up to ${MAX_LINKS} links per post.`);
      return;
    }
    if (value.some((l) => l.url === url)) {
      setError("That link is already on the list.");
      return;
    }
    const label = draftLabel.trim().slice(0, 120);
    onChange([...value, label ? { url, label } : { url }]);
    setDraftUrl("");
    setDraftLabel("");
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {value.map((link, idx) => (
            <li
              key={`${link.url}-${idx}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-subtle/40 px-3 py-2"
            >
              <LinkIcon />
              <div className="min-w-0 flex-1">
                {link.label && (
                  <p className="truncate text-xs font-medium text-foreground/85">
                    {link.label}
                  </p>
                )}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate font-mono text-[10px] text-brand-700 hover:text-brand-800"
                  title={link.url}
                >
                  {hostname(link.url)}
                  <span className="text-muted">{pathOf(link.url)}</span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                aria-label={`Remove ${link.url}`}
                className="rounded-full p-1 text-muted hover:bg-surface hover:text-red-600"
              >
                <XIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Use a div with role=form (not a real <form>) so Enter inside doesn't
          submit the parent post form. */}
      <div
        role="group"
        className="flex flex-wrap items-stretch gap-1.5 rounded-lg border border-dashed border-border-strong/70 bg-subtle/20 p-1.5"
      >
        <input
          type="url"
          inputMode="url"
          value={draftUrl}
          onChange={(e) => {
            setDraftUrl(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(e);
            }
          }}
          placeholder="https://figma.com/file/…"
          maxLength={2000}
          className="h-9 min-w-[180px] flex-[2] rounded-md border border-border bg-surface px-2.5 text-sm placeholder:text-muted focus:border-brand-400"
        />
        <input
          type="text"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(e);
            }
          }}
          placeholder="Label (optional)"
          maxLength={120}
          className="h-9 min-w-[120px] flex-1 rounded-md border border-border bg-surface px-2.5 text-sm placeholder:text-muted focus:border-brand-400"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draftUrl.trim()}
          className="inline-flex h-9 items-center gap-1 rounded-md bg-foreground px-3 text-xs font-medium text-background transition hover:bg-brand-700 disabled:opacity-50"
        >
          <span aria-hidden>＋</span> Add
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-1 text-[10px] text-red-600">
          {error}
        </p>
      ) : (
        <p className="mt-1 text-[10px] text-muted">
          Attach research, brand assets, or any URL you want the team to see
          alongside this post. {MAX_LINKS - value.length} of {MAX_LINKS} slots
          left.
        </p>
      )}
    </div>
  );
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^[a-zA-Z]+:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function pathOf(url: string): string {
  try {
    const u = new URL(url);
    const p = u.pathname + (u.search || "");
    return p === "/" ? "" : p;
  } catch {
    return "";
  }
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-muted"
    >
      <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 10-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 105.66 5.66l1-1" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M5 12.5l4 4L19 7" />
    </svg>
  );
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
