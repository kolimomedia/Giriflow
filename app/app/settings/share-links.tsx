"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ShareLink, Workspace } from "@/lib/types";
import { createShareLink, deleteShareLink } from "@/app/app/actions";

const EXPIRY_OPTIONS = [
  { label: "Never", days: null },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
] as const;

export function ShareLinks({
  workspace,
  initial,
}: {
  workspace: Workspace;
  initial: ShareLink[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<ShareLink[]>(initial);
  const [name, setName] = useState("");
  const [allowComments, setAllowComments] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(30);
  const [busy, startTransition] = useTransition();

  function origin() {
    return typeof window !== "undefined" ? window.location.origin : "";
  }

  function urlFor(link: ShareLink) {
    return `${origin()}/s/${link.token}`;
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const created = await createShareLink({
          workspace_id: workspace.id,
          name: name || undefined,
          allow_comments: allowComments,
          expires_in_days: expiresIn,
        });
        setItems((arr) => [created as ShareLink, ...arr]);
        setName("");
        setAllowComments(false);
        setExpiresIn(30);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Could not create share link");
      }
    });
  }

  async function copy(link: ShareLink) {
    try {
      await navigator.clipboard.writeText(urlFor(link));
    } catch {
      // Fallback for environments without clipboard API: select-and-prompt.
      window.prompt("Copy this share link:", urlFor(link));
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Revoke this share link? Anyone using it will lose access.")) return;
    startTransition(async () => {
      try {
        await deleteShareLink(id);
        setItems((arr) => arr.filter((x) => x.id !== id));
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Share links
          </h2>
          <p className="mt-1 text-sm text-foreground/70">
            Send a read-only link to a client or stakeholder. They see the plan;
            they don't need an account.
          </p>
        </div>
      </div>

      <form
        onSubmit={create}
        className="mt-5 grid gap-3 rounded-xl border border-dashed border-border-strong/70 bg-subtle/30 p-4 sm:grid-cols-[1.4fr_1fr_auto] sm:items-end"
      >
        <div>
          <label htmlFor="share-name" className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
            Label
          </label>
          <input
            id="share-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme — May review"
            maxLength={80}
            className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-brand-400"
          />
        </div>
        <div>
          <label htmlFor="share-exp" className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
            Expires
          </label>
          <select
            id="share-exp"
            value={expiresIn === null ? "null" : String(expiresIn)}
            onChange={(e) =>
              setExpiresIn(e.target.value === "null" ? null : Number(e.target.value))
            }
            className="mt-1 h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-brand-400"
          >
            {EXPIRY_OPTIONS.map((o) => (
              <option key={o.label} value={o.days === null ? "null" : String(o.days)}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create link"}
        </button>
        <label className="sm:col-span-3 mt-1 flex items-center gap-2 text-xs text-foreground/70">
          <input
            type="checkbox"
            checked={allowComments}
            onChange={(e) => setAllowComments(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-brand-500"
          />
          Allow guests to leave comments (they'll be asked for a name)
        </label>
      </form>

      <ul className="mt-5 space-y-2">
        {items.length === 0 && (
          <li className="rounded-xl border border-dashed border-border-strong/60 px-4 py-6 text-center text-xs text-muted">
            No share links yet.
          </li>
        )}
        {items.map((link) => {
          const expired =
            link.expires_at && new Date(link.expires_at).getTime() < Date.now();
          return (
            <li
              key={link.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{link.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {urlFor(link)}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">
                  {expired
                    ? "expired"
                    : link.expires_at
                      ? `expires ${new Date(link.expires_at).toLocaleDateString()}`
                      : "never expires"}{" "}
                  · created {new Date(link.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1.5">
                <a
                  href={urlFor(link)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/75 hover:border-brand-300 hover:text-brand-700"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => copy(link)}
                  className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-brand-700"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => remove(link.id)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-red-300 hover:text-red-700"
                >
                  Revoke
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
