import type { Metadata } from "next";
import { site } from "@/lib/site";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the GiriFlow team. Sales, support, partnerships and press — we read everything that lands at hello@giriflow.com.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 lg:px-10 lg:pt-28">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-600">Contact</p>
          <h1 className="mt-3 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Say <span className="text-brand-600 italic">hello.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/75">
            We read every message. Sales, support, partnerships, or just to say
            our colour palette is doing a number on you — all welcome.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1.2fr] lg:px-10">
        <div className="space-y-6">
          <ContactCard
            label="Email us"
            value={site.contact.email}
            href={`mailto:${site.contact.email}`}
            body="Fastest path to a human. We aim to reply within one business day."
          />
          <ContactCard
            label="Sales"
            value="Book a 20-min call"
            href={`mailto:${site.contact.email}?subject=GiriFlow%20demo`}
            body="For teams of 5+ or agencies running multiple clients."
          />
          <ContactCard
            label="On the socials"
            value={site.social.instagram.replace("https://", "")}
            href={site.social.instagram}
            body="@giriflow on every platform. Mostly behind-the-scenes."
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-xl font-semibold tracking-tight">Or — drop your email</h2>
          <p className="mt-2 text-sm text-foreground/70">
            We'll add you to the early-access list and reach out as we onboard
            your cohort.
          </p>
          <div className="mt-6">
            <WaitlistForm />
          </div>
          <p className="mt-4 text-xs text-muted">
            By submitting, you agree to occasional product emails. Unsubscribe
            anytime.
          </p>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  label,
  value,
  href,
  body,
}: {
  label: string;
  value: string;
  href: string;
  body: string;
}) {
  return (
    <a
      href={href}
      className="group block rounded-2xl border border-border bg-surface p-6 transition hover:border-brand-300 hover:shadow-[0_25px_50px_-30px_rgba(13,82,46,0.35)]"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-brand-700">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">
        {value}
        <span className="ml-2 inline-block text-brand-600 transition group-hover:translate-x-1">→</span>
      </p>
      <p className="mt-2 text-sm text-foreground/70">{body}</p>
    </a>
  );
}
