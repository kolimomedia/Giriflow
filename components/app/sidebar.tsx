"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo";

type Props = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const items = [
  { href: "/app/calendar", label: "Calendar", icon: "calendar" as const },
  { href: "/app/posts", label: "Posts", icon: "posts" as const },
  { href: "/app/profile", label: "Profile", icon: "user" as const },
  { href: "/app/settings", label: "Settings", icon: "settings" as const },
];

/**
 * Dashboard sidebar — logo + primary nav only. The workspace switcher,
 * profile badge, search and notifications all live in the Topbar.
 */
export function Sidebar({ mobileOpen = false, onMobileClose }: Props) {
  const pathname = usePathname();

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

      <nav className="flex-1 space-y-1 p-3" aria-label="Workspace">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
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

      <div className="border-t border-border p-4 text-[10px] uppercase tracking-widest text-muted">
        GiriFlow · v0.1
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
