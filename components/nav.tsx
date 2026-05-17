"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { nav } from "@/lib/site";

export function Nav() {
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
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/#waitlist"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-brand-700"
          >
            Get early access
            <span aria-hidden>→</span>
          </Link>
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
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-foreground/85 hover:bg-subtle"
              >
                Sign in
              </Link>
              <Link
                href="/#waitlist"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
              >
                Get early access
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
