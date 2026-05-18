"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkspace, setActiveWorkspace } from "@/app/app/actions";
import type { Workspace } from "@/lib/types";

type Props = {
  workspace: Workspace;
  workspaces: Workspace[];
  /** Visual variant. `compact` for tight spaces (mobile), `default` everywhere else. */
  variant?: "default" | "compact";
  className?: string;
};

export function WorkspaceSwitcher({
  workspace,
  workspaces,
  variant = "default",
  className = "",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pickWorkspace(id: string) {
    if (id === workspace.id) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await setActiveWorkspace(id);
      setOpen(false);
      router.refresh();
    });
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const value = name;
    setName("");
    startTransition(async () => {
      try {
        await createWorkspace(value);
        setCreating(false);
        setOpen(false);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Could not create workspace");
      }
    });
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={[
          "flex items-center gap-2.5 rounded-full border border-border bg-surface text-left transition hover:border-brand-300",
          variant === "compact" ? "h-9 pl-1 pr-2.5" : "h-10 pl-1.5 pr-3",
        ].join(" ")}
      >
        <WorkspaceAvatar name={workspace.name} small={variant === "compact"} />
        <span
          className={[
            "min-w-0 truncate font-medium",
            variant === "compact" ? "text-xs max-w-[120px]" : "text-sm max-w-[180px]",
          ].join(" ")}
        >
          {workspace.name}
        </span>
        <ChevronIcon dir={open ? "up" : "down"} />
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-40 w-64 origin-top-left rounded-xl border border-border bg-surface p-1 shadow-[0_20px_50px_-20px_rgba(14,47,100,0.45)]">
          <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Workspaces
          </p>
          <ul className="max-h-64 overflow-y-auto" role="listbox">
            {workspaces.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={w.id === workspace.id}
                  onClick={() => pickWorkspace(w.id)}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition",
                    w.id === workspace.id
                      ? "bg-brand-50 text-brand-800"
                      : "text-foreground/85 hover:bg-subtle",
                  ].join(" ")}
                >
                  <WorkspaceAvatar name={w.name} small />
                  <span className="min-w-0 truncate">{w.name}</span>
                  {w.id === workspace.id && (
                    <CheckIcon className="ml-auto h-3.5 w-3.5 text-brand-600" />
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="my-1 border-t border-border" />
          {creating ? (
            <form onSubmit={submitCreate} className="p-1.5">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="Workspace name"
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm focus:border-brand-400"
                disabled={busy}
              />
              <div className="mt-1.5 flex gap-1.5">
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="inline-flex h-8 flex-1 items-center justify-center rounded-lg bg-foreground text-xs font-medium text-background hover:bg-brand-700 disabled:opacity-60"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setName("");
                  }}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-border px-3 text-xs text-foreground/70"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-brand-700 hover:bg-brand-50"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-brand-300 text-brand-600">
                ＋
              </span>
              Create workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function WorkspaceAvatar({ name, small = false }: { name: string; small?: boolean }) {
  const cls = small ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-[11px]";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-brand-gradient font-semibold text-white ${cls}`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function ChevronIcon({ dir }: { dir: "down" | "up" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-muted"
    >
      <path d={dir === "down" ? "M8 9l4 4 4-4" : "M8 15l4-4 4 4"} />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12.5l4 4L19 7" />
    </svg>
  );
}
