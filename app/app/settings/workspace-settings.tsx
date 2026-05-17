"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Workspace } from "@/lib/types";
import { deleteWorkspace, renameWorkspace } from "@/app/app/actions";

export function WorkspaceSettings({
  workspace,
  totalWorkspaces,
  isOwner,
  memberCount,
}: {
  workspace: Workspace;
  totalWorkspaces: number;
  isOwner: boolean;
  memberCount: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [busy, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const canDelete = isOwner && totalWorkspaces > 1;

  function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setError(null);
    startTransition(async () => {
      try {
        await renameWorkspace(workspace.id, name);
        setStatus("saved");
        router.refresh();
        setTimeout(() => setStatus("idle"), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
        setStatus("error");
      }
    });
  }

  function confirmDelete() {
    if (!canDelete) return;
    const ok = window.confirm(
      `Delete "${workspace.name}"? All posts, comments and share links in this workspace will be permanently removed.`,
    );
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteWorkspace(workspace.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Workspace
      </h2>

      <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr] sm:items-center">
        <label htmlFor="ws-name" className="text-sm text-foreground/70">
          Name
        </label>
        <div className="flex gap-2">
          <input
            id="ws-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            disabled={!isOwner}
            className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm focus:border-brand-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !isOwner || name === workspace.name}
            className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? "Saving…" : status === "saved" ? "Saved ✓" : "Save"}
          </button>
        </div>
      </form>

      <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-[140px_1fr]">
        <dt className="text-foreground/65">Members</dt>
        <dd>{memberCount}</dd>
        <dt className="text-foreground/65">Created</dt>
        <dd>{new Date(workspace.created_at).toLocaleDateString()}</dd>
        <dt className="text-foreground/65">Workspace ID</dt>
        <dd className="font-mono text-xs text-foreground/65">{workspace.id}</dd>
      </dl>

      {!isOwner && (
        <p className="mt-4 rounded-lg bg-subtle/60 px-3 py-2 text-xs text-foreground/70">
          You're not the owner of this workspace — rename / delete are
          locked.
        </p>
      )}

      {error && status === "error" && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
          Danger zone
        </p>
        <p className="mt-2 text-sm text-foreground/70">
          Permanently delete this workspace and everything in it.
        </p>
        <button
          type="button"
          onClick={confirmDelete}
          disabled={!canDelete || busy}
          title={
            !canDelete
              ? "You can't delete your only workspace."
              : "Delete workspace"
          }
          className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete workspace
        </button>
      </div>
    </section>
  );
}
