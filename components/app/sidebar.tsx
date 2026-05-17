"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo";
import type { Workspace } from "@/lib/types";

type Props = {
  user: { id: string; email: string };
  workspace: Workspace;
  workspaces: Workspace[];
};

const items = [
  { href: "/app/calendar", label: "Calendar", icon: "calendar" as const },
  { href: "/app/posts",    label: "Posts",    icon: "posts" as const },
  { href: "/app/settings", label: "Settings", icon: "settings" as const },
];

export function Sidebar({ user, workspace }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/app" className="inline-flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <span className="text-base font-semibold tracking-tight">
            Giri<span className="text-brand-500 italic">Flow</span>
          </span>
        </Link>
      </div>

      <div className="border-b border-border px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-subtle/50 px-3 py-2.5 text-left transition hover:border-brand-300"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-semibold text-white">
              {workspace.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 truncate text-sm font-medium">
              {workspace.name}
            </span>
          </span>
          <ChevronIcon />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
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
        <div className="flex items-center gap-2.5 rounded-xl bg-subtle/50 px-3 py-2.5">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
            {(user.email[0] || "?").toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-foreground/85">
            {user.email}
          </span>
          <form action="/auth/signout" method="post" className="shrink-0">
            <button
              type="submit"
              title="Sign out"
              className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-foreground"
            >
              <SignOutIcon />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function ItemIcon({ name, active }: { name: "calendar" | "posts" | "settings"; active: boolean }) {
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
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${cls}`}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 00.3 1.7l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.7-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 008.4 19a1.6 1.6 0 00-1.7.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.7 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1A1.6 1.6 0 005 8.4a1.6 1.6 0 00-.3-1.7l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.7.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.7-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.7V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-muted">
      <path d="M8 9l4 4 4-4" />
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
