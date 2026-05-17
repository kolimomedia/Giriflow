"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LogoMark } from "@/components/logo";
import type { Profile, Workspace } from "@/lib/types";
import { createWorkspace, setActiveWorkspace } from "@/app/app/actions";

type Props = {
  user: { id: string; email: string };
  profile: Profile | null;
  workspace: Workspace;
  workspaces: Workspace[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const items = [
  { href: "/app/calendar", label: "Calendar", icon: "calendar" as const },
  { href: "/app/posts", label: "Posts", icon: "posts" as const },
  { href: "/app/profile", label: "Profile", icon: "user" as const },
  { href: "/app/settings", label: "Settings", icon: "settings" as const },
];

export function Sidebar({
  user,
  profile,
  workspace,
  workspaces,
  mobileOpen = false,
  onMobileClose,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, startTransition] = useTransition();

  const displayName = profile?.display_name || user.email;

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

  const body = (
    <>
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
        <Link href="/app" className="inline-flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <span className="text-base font-semibold tracking-tight">
            Giri<span className="text-brand-500 italic">Flow</span>
          </span>
        </Link>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-foreground md:hidden"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Workspace switcher */}
      <div className="relative border-b border-border px-3 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-subtle/50 px-3 py-2.5 text-left transition hover:border-brand-300"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <WorkspaceAvatar name={workspace.name} />
            <span className="min-w-0 truncate text-sm font-medium">
              {workspace.name}
            </span>
          </span>
          <ChevronIcon dir={open ? "up" : "down"} />
        </button>

        {open && (
          <div className="absolute left-3 right-3 z-30 mt-1.5 origin-top rounded-xl border border-border bg-surface p-1 shadow-[0_20px_50px_-20px_rgba(14,47,100,0.45)]">
            <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Workspaces
            </p>
            <ul className="max-h-64 overflow-y-auto">
              {workspaces.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
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

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-brand-50 text-brand-800"
                  : "text-foreground/75 hover:bg-subtle hover:text-foreground",
              ].join(" ")}
            >
              <ItemIcon name={item.icon} active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/app/profile"
          className="flex items-center gap-2.5 rounded-xl bg-subtle/50 px-3 py-2.5 hover:bg-subtle"
        >
          <UserAvatar profile={profile} email={user.email} />
          <span className="min-w-0 flex-1 truncate text-xs text-foreground/85">
            {displayName}
          </span>
        </Link>
        <form action="/auth/signout" method="post" className="mt-2">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-muted transition hover:bg-subtle hover:text-foreground"
          >
            <SignOutIcon />
            Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        {body}
      </aside>

      {/* Mobile drawer */}
      <div
        className={[
          "fixed inset-0 z-50 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onMobileClose}
          className={[
            "absolute inset-0 bg-foreground/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar"
          className={[
            "safe-top absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-surface shadow-[0_20px_50px_-20px_rgba(14,47,100,0.45)] transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {body}
        </aside>
      </div>
    </>
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
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
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

function UserAvatar({ profile, email }: { profile: Profile | null; email: string }) {
  if (profile?.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt=""
        className="h-7 w-7 shrink-0 rounded-full object-cover"
      />
    );
  }
  const letter = (profile?.display_name?.[0] || email[0] || "?").toUpperCase();
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
      {letter}
    </span>
  );
}

function ItemIcon({
  name,
  active,
}: {
  name: "calendar" | "posts" | "settings" | "user";
  active: boolean;
}) {
  const cls = active ? "text-brand-700" : "text-muted";
  if (name === "calendar")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${cls}`}>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 9.5h17" />
        <path d="M8 3.5v3M16 3.5v3" />
      </svg>
    );
  if (name === "posts")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${cls}`}>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </svg>
    );
  if (name === "user")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${cls}`}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0116 0" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${cls}`}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 00.3 1.7l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.7-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 008.4 19a1.6 1.6 0 00-1.7.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.7 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1A1.6 1.6 0 005 8.4a1.6 1.6 0 00-.3-1.7l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.7.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.7-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.7V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "down" | "up" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-muted">
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

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9 5H5a2 2 0 00-2 2v10a2 2 0 002 2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
