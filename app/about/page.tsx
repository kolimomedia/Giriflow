import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "GiriFlow is the social media planner from the Giri family — built by people who run agencies and creator studios for people who do the same.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 lg:px-10 lg:pt-28">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-600">About</p>
          <h1 className="mt-3 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            We built this because the spreadsheet kept <span className="text-brand-600 italic">losing</span>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/75">
            Every team we know plans content the same way: a tab in a sheet, a
            Trello board duct-taped to it, screenshots in a WhatsApp group, and
            a PDF made by hand on Sunday night. GiriFlow is the calendar that
            replaces all of that — without making you learn a new way to work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">What we believe</h2>
            <p className="mt-3 text-sm text-foreground/70">
              The opinions that shaped the product.
            </p>
          </div>
          <ul className="space-y-6">
            {[
              {
                t: "Planning is a team sport.",
                b: "A calendar that one person can use isn't enough. The whole team — and the client — needs to see it.",
              },
              {
                t: "Clients shouldn't need an account.",
                b: "Friction kills approvals. A link, a comment, a thumbs-up — that's the bar.",
              },
              {
                t: "Calendars are about rhythm, not rows.",
                b: "A spreadsheet shows tasks. A calendar shows the cadence of your brand. That's a different feeling.",
              },
              {
                t: "Export everything.",
                b: "Your plan lives in a tool today; it should live anywhere tomorrow. PDF, link, CSV — choose.",
              },
            ].map((row) => (
              <li key={row.t} className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-base font-semibold">{row.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{row.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-border bg-subtle/40">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-600">{site.family.label}</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            One family, many tools.
          </h2>
          <p className="mt-4 max-w-2xl text-foreground/75">
            Giri makes business tools for creative teams. GiriBooks handles the
            invoices. GiriFlow handles the plan. One login, one brand, one
            growing set of pieces that fit together.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {site.family.siblings.map((s) => (
              <a
                key={s.name}
                href={s.url}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 hover:border-brand-300"
              >
                <div>
                  <p className="text-base font-semibold tracking-tight">{s.name}</p>
                  <p className="mt-1 text-sm text-foreground/65">{s.note}</p>
                </div>
                <span className="text-brand-600 transition group-hover:translate-x-1">→</span>
              </a>
            ))}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-border-strong bg-transparent p-5">
              <div>
                <p className="text-base font-semibold tracking-tight">More coming</p>
                <p className="mt-1 text-sm text-foreground/65">Quietly shipping, one tool at a time.</p>
              </div>
              <span className="text-muted">···</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center lg:px-10">
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          Want to try it before it's public?
        </h2>
        <p className="mt-4 text-foreground/70">
          We're letting people in weekly. First taste is on us.
        </p>
        <Link
          href="/#waitlist"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700"
        >
          Join the waitlist
          <span aria-hidden>→</span>
        </Link>
      </section>
    </>
  );
}
