"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WorkspaceSwitcher } from "./workspace-switcher";
import type { Profile, Workspace } from "@/lib/types";

type Props = {
  user: { id: string; email: string };
  profile: Profile | null;
  workspace: Workspace;
  workspaces: Workspace[];
  onOpenMobileMenu: () => void;
};

export function Topbar({
  user,
  profile,
  workspace,
  workspaces,
  onOpenMobileMenu,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/app/posts?q=${encodeURIComponent(q)}` : "/app/posts");
  }

  return (
    <header className="safe-top sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur sm:h-16 sm:gap-3 sm:px-5">
      {/* Mobile hamburger — opens the sidebar drawer */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-subtle md:hidden"
      >
        <MenuIcon />
      </button>

      <WorkspaceSwitcher
        workspace={workspace}
        workspaces={workspaces}
        variant="compact"
        className="sm:[--ws-default:1]"
      />

      {/* Search — wider on desktop, hidden by an icon on small screens */}
      <form
        onSubmit={submitSearch}
        role="search"
        className="ml-1 hidden flex-1 items-center md:flex"
      >
        <label htmlFor="topbar-search" className="sr-only">
          Search posts
        </label>
        <div className="relative w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="topbar-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, captions, channels…"
            className="h-9 w-full rounded-full border border-border bg-subtle/40 pl-9 pr-4 text-sm placeholder:text-muted focus:border-brand-400 focus:bg-surface"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
        {/* Mobile search jump button */}
        <Link
          href="/app/posts"
          aria-label="Search posts"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-subtle hover:text-foreground md:hidden"
        >
          <SearchIcon className="h-4 w-4" />
        </Link>

        <NotificationsButton />

        <Link
          href="/app/settings"
          aria-label="Settings"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-subtle hover:text-foreground"
        >
          <GearIcon className="h-4.5 w-4.5" />
        </Link>

        <ProfileBadge user={user} profile={profile} />
      </div>
    </header>
  );
}

function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 hover:bg-subtle hover:text-foreground"
      >
        <BellIcon className="h-4.5 w-4.5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-40 w-72 overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-[0_20px_50px_-20px_rgba(14,47,100,0.45)]"
        >
          <div className="flex items-center justify-between border-b border-border pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Notifications
            </p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
              You're all caught up
            </span>
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            New comments, approvals and scheduled posts will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileBadge({
  user,
  profile,
}: {
  user: { email: string };
  profile: Profile | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
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

  const label = profile?.display_name || user.email;
  const sub = profile?.display_name ? user.email : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full border border-border bg-surface p-0.5 pr-3 transition hover:border-brand-300"
      >
        <Avatar profile={profile} email={user.email} />
        <span className="hidden max-w-[8rem] truncate text-xs font-medium text-foreground/85 lg:inline">
          {firstName(label)}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-40 min-w-[240px] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-[0_20px_50px_-20px_rgba(14,47,100,0.45)]"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-3 py-3">
            <Avatar profile={profile} email={user.email} large />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{label}</p>
              {sub && <p className="truncate text-[11px] text-muted">{sub}</p>}
            </div>
          </div>
          <MenuItem href="/app/profile" onClick={() => setOpen(false)}>
            Profile
          </MenuItem>
          <MenuItem href="/app/settings" onClick={() => setOpen(false)}>
            Settings
          </MenuItem>
          <div className="my-1 border-t border-border" />
          <form action="/auth/signout" method="post" role="none">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground/85 hover:bg-subtle"
            >
              <SignOutIcon />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-subtle"
    >
      {children}
    </Link>
  );
}

function Avatar({
  profile,
  email,
  large = false,
}: {
  profile: Profile | null;
  email: string;
  large?: boolean;
}) {
  const cls = large ? "h-8 w-8 text-[12px]" : "h-7 w-7 text-[11px]";
  if (profile?.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt=""
        className={`${cls} shrink-0 rounded-full object-cover`}
      />
    );
  }
  const letter = (profile?.display_name?.[0] || email[0] || "?").toUpperCase();
  return (
    <span
      className={`${cls} inline-flex shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-background`}
    >
      {letter}
    </span>
  );
}

function firstName(label: string): string {
  if (label.includes("@")) return label.split("@")[0];
  return label.split(" ")[0];
}

/* ── icons ────────────────────────────────────────────────────────────── */

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function BellIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" />
      <path d="M9.5 21a2.5 2.5 0 005 0" />
    </svg>
  );
}

function GearIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 00.3 1.7l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.7-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 008.4 19a1.6 1.6 0 00-1.7.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.7 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1A1.6 1.6 0 005 8.4a1.6 1.6 0 00-.3-1.7l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.7.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.7-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.7V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
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
