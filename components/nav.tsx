"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";
import { nav } from "@/lib/site";
import type { CurrentUser } from "@/lib/auth";

export function Nav({ user }: { user: CurrentUser | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur"
          : "border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Logo />

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm text-foreground/75 transition hover:bg-subtle hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-brand-700"
              >
                Start free trial
                <span aria-hidden>→</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-4">
            <span
              className={[
                "absolute left-0 top-0 h-[2px] w-full rounded bg-foreground transition-transform",
                open ? "translate-y-[5px] rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "absolute left-0 bottom-0 h-[2px] w-full rounded bg-foreground transition-transform",
                open ? "-translate-y-[5px] -rotate-45" : "",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-foreground/85 hover:bg-subtle"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-subtle/50 px-3 py-2.5">
                    <Avatar user={user} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.displayName || user.email}
                      </p>
                      {user.displayName && (
                        <p className="truncate text-xs text-muted">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/app/calendar"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base text-foreground/85 hover:bg-subtle"
                  >
                    Calendar
                  </Link>
                  <Link
                    href="/app/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base text-foreground/85 hover:bg-subtle"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/app/settings"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base text-foreground/85 hover:bg-subtle"
                  >
                    Settings
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full rounded-xl px-3 py-3 text-left text-base text-foreground/85 hover:bg-subtle"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-3 text-base text-foreground/85 hover:bg-subtle"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
                  >
                    Start free trial
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function UserMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
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

  const label = user.displayName || user.email;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-1 py-1 pr-3 text-sm font-medium text-foreground/85 transition hover:border-brand-300"
      >
        <Avatar user={user} size="sm" />
        <span className="max-w-[10rem] truncate">{label}</span>
        <ChevronDown />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-[0_20px_50px_-20px_rgba(14,47,100,0.45)]"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{label}</p>
            {user.displayName && (
              <p className="truncate text-xs text-muted">{user.email}</p>
            )}
          </div>
          <MenuLink href="/app/calendar" onSelect={() => setOpen(false)}>
            Calendar
          </MenuLink>
          <MenuLink href="/app/profile" onSelect={() => setOpen(false)}>
            Profile
          </MenuLink>
          <MenuLink href="/app/settings" onSelect={() => setOpen(false)}>
            Settings
          </MenuLink>
          <div className="my-1 border-t border-border" />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground/85 transition hover:bg-subtle hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/85 transition hover:bg-subtle hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function Avatar({
  user,
  size,
}: {
  user: CurrentUser;
  size: "sm" | "md";
}) {
  const cls = size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-sm";
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className={`${cls} shrink-0 rounded-full object-cover`}
      />
    );
  }
  const letter = (user.displayName?.[0] || user.email[0] || "?").toUpperCase();
  return (
    <span
      className={`${cls} inline-flex shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-background`}
    >
      {letter}
    </span>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-muted"
      aria-hidden
    >
      <path d="M8 10l4 4 4-4" />
    </svg>
  );
}
