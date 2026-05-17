"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo";
import { Sidebar } from "@/components/app/sidebar";
import type { Profile, Workspace } from "@/lib/types";

type Props = {
  user: { id: string; email: string };
  profile: Profile | null;
  workspace: Workspace;
  workspaces: Workspace[];
  children: React.ReactNode;
};

export function AppShell({
  user,
  profile,
  workspace,
  workspaces,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the user navigates.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar
        user={user}
        profile={profile}
        workspace={workspace}
        workspaces={workspaces}
        mobileOpen={open}
        onMobileClose={() => setOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar. Sticky so it stays put while pages scroll. */}
        <header className="safe-top sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/95 px-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-subtle"
          >
            <MenuIcon />
          </button>
          <Link href="/app" className="inline-flex min-w-0 items-center gap-2">
            <LogoMark className="h-6 w-6 shrink-0" />
            <span className="min-w-0 truncate text-sm font-semibold tracking-tight">
              {workspace.name}
            </span>
          </Link>
        </header>

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
