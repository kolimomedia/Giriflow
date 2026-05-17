"use client";

import { useEffect, useState } from "react";
import { channelMeta, channelIds, statusIds, statusMeta } from "@/lib/channels";
import type { Post } from "@/lib/types";

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
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function PostFormModal({ initial, defaultScheduledAt, onClose, onSave, onDelete }: Props) {
  const [channel, setChannel] = useState<string>(initial?.channel ?? "instagram");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [status, setStatus] = useState<string>(initial?.status ?? "draft");
  const [scheduledLocal, setScheduledLocal] = useState(() => {
    const d = initial ? new Date(initial.scheduled_at) : (defaultScheduledAt ?? new Date());
    return toLocalInput(d);
  });
  const [busy, setBusy] = useState<"" | "save" | "delete">("");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSave}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_60px_-20px_rgba(14,47,100,0.5)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight">
            {initial ? "Edit post" : "New post"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-subtle hover:text-foreground"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

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
                        active ? "border-brand-500 bg-brand-50 text-brand-800" : "border-border text-foreground/70 hover:border-brand-300",
                      ].join(" ")}
                    >
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: m.dot }} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-subtle/40 px-6 py-3">
          <div>
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
              {busy === "save" ? "Saving…" : initial ? "Save changes" : "Create post"}
            </button>
          </div>
        </div>
      </form>
    </div>
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function toLocalInput(d: Date): string {
  // datetime-local expects YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
