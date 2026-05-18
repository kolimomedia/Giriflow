import Link from "next/link";
import type { Metadata } from "next";
import { pricingTiers, faqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for solo creators, teams and agencies. Free forever for one person. $19 per editor for teams. Guests and clients always free.",
};

export default function PricingPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-12 lg:px-10 lg:pt-28">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-brand-600">
              Pricing
            </p>
            <h1 className="mt-3 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Pay for the planners. <span className="text-brand-600 italic">Not the audience.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/75">
              Free for one person. $19 per editor for teams. Guests, reviewers
              and clients are always free — invite as many as you want.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <article
              key={tier.name}
              className={[
                "relative flex flex-col rounded-2xl border p-8",
                tier.highlight
                  ? "border-brand-500 bg-gradient-to-br from-brand-50 to-surface shadow-[0_30px_60px_-30px_rgba(13,82,46,0.4)]"
                  : "border-border bg-surface",
              ].join(" ")}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold tracking-tight">{tier.name}</h3>
              <p className="mt-1 text-sm text-foreground/65">{tier.summary}</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-semibold tracking-tight">{tier.price}</span>
                <span className="text-sm text-muted">{tier.cadence}</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                        <path d="M5 12.5l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={[
                  "mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition",
                  tier.highlight
                    ? "bg-foreground text-background hover:bg-brand-700"
                    : "border border-border text-foreground/85 hover:border-brand-300 hover:text-brand-700",
                ].join(" ")}
              >
                {tier.cta}
                <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-subtle/40 p-8">
          <div className="grid gap-8 md:grid-cols-3">
            <SmallTout title="Always free" body="Viewers, reviewers and client guests. Invite as many as the campaign needs." />
            <SmallTout title="No card to start" body="Solo is free forever. Studio is a 14-day trial — no card required." />
            <SmallTout title="Cancel anytime" body="Month-to-month, prorated, exported clean. Your data is yours." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-10">
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
          Questions before you start
        </h2>
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
                {f.q}
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-foreground/60 transition group-open:rotate-45 group-open:bg-brand-50 group-open:text-brand-700">
                  ＋
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function SmallTout({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-brand-700">{title}</p>
      <p className="mt-2 text-sm text-foreground/75">{body}</p>
    </div>
  );
}
