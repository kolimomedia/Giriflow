import Link from "next/link";
import { CalendarPreview } from "@/components/calendar-preview";
import { ChannelMarquee } from "@/components/channel-marquee";
import { WaitlistForm } from "@/components/waitlist-form";
import { features, useCases, steps, faqs, site } from "@/lib/site";
import { iconMap } from "@/components/icons";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-noise opacity-60" aria-hidden />

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 lg:px-10 lg:pt-28 lg:pb-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Link
                href="#waitlist"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur"
              >
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
                Now in early access — join the waitlist
                <span aria-hidden>→</span>
              </Link>

              <h1 className="mt-6 text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-[4.25rem]">
                Plan your social, <span className="text-brand-600 italic">together.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/75">
                GiriFlow is the calendar your whole team — and your clients — can
                actually use. Plan the day, the week, the month, or a whole year.
                Approve in one click. Export as a clean PDF. Share with a link.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="#waitlist"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700"
                >
                  Start planning free
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-surface px-6 text-sm font-medium text-foreground/85 transition hover:border-brand-300 hover:text-brand-700"
                >
                  See how it works
                </Link>
              </div>

              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
                <Stat label="Channels" value="6+" />
                <Stat label="Calendar views" value="4" />
                <Stat label="Setup" value="2 min" />
              </dl>
            </div>

            <div className="animate-float lg:pl-6">
              <CalendarPreview />
            </div>
          </div>
        </div>

        {/* Channel marquee */}
        <div className="border-y border-border bg-surface/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8">
              <p className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-muted">
                Plans every channel your audience lives on
              </p>
              <div className="min-w-0 flex-1">
                <ChannelMarquee />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <SectionHeader
          eyebrow="Features"
          title="Everything a content calendar should have. Nothing it shouldn't."
          body="GiriFlow strips planning down to the parts that matter — and makes them feel obvious."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = iconMap[f.icon as keyof typeof iconMap];
            return (
              <article
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_25px_50px_-30px_rgba(14,47,100,0.4)]"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-50 opacity-0 transition group-hover:opacity-100" aria-hidden />
                <div className="relative">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">{f.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative isolate overflow-hidden border-y border-border bg-subtle/40">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <SectionHeader
            eyebrow="How it works"
            title="From blank calendar to scheduled month — in an afternoon."
            body="Four small steps. Most teams set up over a coffee."
          />

          <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li
                key={s.n}
                className="relative rounded-2xl border border-border bg-surface p-6"
              >
                <span className="font-mono text-xs text-brand-600">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.body}</p>
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-3 top-10 hidden text-brand-300 lg:block"
                  >
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* COLLABORATION */}
      <section id="collaboration" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand-600">
              Built for teams + clients
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              The plan everyone can see — without giving everyone the keys.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/75">
              Editors draft. Reviewers comment. Clients approve. Guests get a link
              that opens to <em>their</em> calendar — and nothing else.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                { t: "Role-based permissions", d: "Owner, editor, reviewer, viewer. The right access, no Slack-DM workarounds." },
                { t: "Comments on every post", d: "Thread feedback right on the asset. No more screenshot replies." },
                { t: "Read-only share links", d: "Send a URL. Clients see the plan instantly. Optional password, expiry, watermark." },
                { t: "Activity timeline", d: "Who changed what, when. Restore an older version in one click." },
              ].map((row) => (
                <li key={row.t} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <CheckIcon />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{row.t}</p>
                    <p className="text-sm text-foreground/70">{row.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <CollaborationMock />
        </div>
      </section>

      {/* EXPORT / SHARE */}
      <section className="border-y border-border bg-subtle/40">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <ExportMock />

            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-brand-600">
                Export &amp; share
              </p>
              <h2 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                A PDF or a link. Whatever your client opens first.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/75">
                Some clients want a printable calendar to mark up over coffee.
                Others want a link they can refresh on their phone. GiriFlow does
                both — branded, on-message, ready to send.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <FeatureLine
                  icon="pdf"
                  title="Branded PDF"
                  body="Your logo, your colours. Per week or per month."
                />
                <FeatureLine
                  icon="link"
                  title="Share link"
                  body="Password-protected, expiring, view-only or comment-only."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <SectionHeader
          eyebrow="Who it's for"
          title="For one person, one team, or one agency with twenty clients."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {useCases.map((uc, i) => (
            <article
              key={uc.audience}
              className={[
                "relative overflow-hidden rounded-2xl border p-6",
                i === 1
                  ? "border-brand-300 bg-gradient-to-br from-brand-50 to-surface"
                  : "border-border bg-surface",
              ].join(" ")}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-brand-700">
                {uc.audience}
              </p>
              <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight">
                {uc.headline}
              </h3>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground/80">
                {uc.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="overflow-hidden rounded-3xl border border-border bg-surface p-10 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-brand-600">
                Pricing
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Free for one person. $19/editor for teams. No surprises.
              </h2>
              <p className="mt-4 max-w-xl text-foreground/70">
                Guest viewers and clients are always free. You only pay for the
                people doing the planning.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700"
            >
              See full pricing
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-10">
        <SectionHeader
          eyebrow="FAQ"
          title="The things people ask before they sign up."
        />
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-surface">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium text-foreground/90 list-none">
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

      {/* WAITLIST CTA */}
      <section
        id="waitlist"
        className="relative isolate overflow-hidden border-t border-border"
      >
        <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-10">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-700">
            Early access
          </p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Stop planning in spreadsheets. Start planning in flow.
          </h2>
          <p className="mt-5 text-lg text-foreground/75">
            Drop your email. We're letting people in weekly — early users get a
            year of Studio at half price.
          </p>

          <div className="mt-8 flex justify-center">
            <WaitlistForm />
          </div>

          <p className="mt-6 text-xs text-muted">
            We'll only email you about {site.name}. Unsubscribe in one click.
          </p>
        </div>
      </section>
    </>
  );
}

/* ——— small bits ——— */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="text-2xl font-semibold tracking-tight">{value}</dd>
      <dt className="mt-1 text-xs uppercase tracking-widest text-muted">{label}</dt>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-brand-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        {title}
      </h2>
      {body && <p className="mt-5 text-lg text-foreground/70">{body}</p>}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M5 12.5l4 4L19 7" />
    </svg>
  );
}

function FeatureLine({
  icon,
  title,
  body,
}: {
  icon: keyof typeof iconMap;
  title: string;
  body: string;
}) {
  const Icon = iconMap[icon];
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-foreground/65 leading-relaxed">{body}</p>
    </div>
  );
}

function CollaborationMock() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-6 -z-10 rounded-3xl blur-2xl opacity-60"
        style={{
          background:
            "radial-gradient(50% 60% at 30% 20%, rgba(31,116,241,.18), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_60px_-30px_rgba(14,47,100,0.35)]">
        <div className="flex items-center justify-between border-b border-border bg-subtle/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "#fdf4ff", color: "#86198f" }}>IG</span>
            <p className="text-sm font-semibold">Carousel: 5 tips for Q3</p>
          </div>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">In review</span>
        </div>
        <div className="grid grid-cols-[1.1fr_1fr]">
          <div className="border-r border-border p-4">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-100 via-brand-200 to-brand-400">
              <div className="flex h-full w-full items-end p-4">
                <div className="rounded-xl bg-surface/85 px-3 py-2 backdrop-blur">
                  <p className="text-[11px] font-semibold text-brand-800">SLIDE 1 / 5</p>
                  <p className="text-sm font-semibold">5 things we wish we knew about Q3</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-foreground/70">
              Caption — Three quarters in and we're shipping faster than ever.
              Here's what got us here ↓
            </p>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Activity</p>
            <Comment author="Tola M." tint="#d946ef" time="2h">
              Love the hook. Can we swap slide 3 with the case study?
            </Comment>
            <Comment author="You" tint="var(--brand-500)" time="1h">
              Done — re-uploaded. @Ruth ready for your eyes.
            </Comment>
            <Comment author="Ruth (client)" tint="#0ea5e9" time="now" guest>
              Approved. Looks great — let's ship Thursday 10am.
            </Comment>
            <div className="mt-auto rounded-xl border border-brand-200 bg-brand-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                Approval
              </p>
              <p className="mt-1 text-sm font-medium text-brand-900">
                ✓ Ruth approved · scheduled for Thu 10:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Comment({
  author,
  tint,
  time,
  guest = false,
  children,
}: {
  author: string;
  tint: string;
  time: string;
  guest?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
        style={{ background: tint }}
      >
        {author.slice(0, 2)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold">{author}</p>
          {guest && (
            <span className="rounded-full bg-subtle px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted">
              guest
            </span>
          )}
          <span className="text-[10px] text-muted">{time}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-foreground/80">{children}</p>
      </div>
    </div>
  );
}

function ExportMock() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-6 -z-10 rounded-3xl blur-2xl opacity-60"
        style={{
          background:
            "radial-gradient(50% 60% at 70% 30%, rgba(56,189,248,.30), transparent 70%)",
        }}
        aria-hidden
      />
      {/* PDF card */}
      <div className="relative mx-auto w-full max-w-md rotate-[-3deg] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_40px_70px_-30px_rgba(14,47,100,0.4)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded bg-brand-500" />
            <p className="text-sm font-semibold">Acme Co. — May plan</p>
          </div>
          <p className="font-mono text-[10px] text-muted">Page 1 / 4</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-7 gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted">
            {["M","T","W","T","F","S","S"].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => {
              const palette = ["#d946ef", "#0ea5e9", "#1e40af", "#1f74f1", "#ef4444"];
              const has = i % 3 === 0;
              return (
                <div key={i} className="aspect-square rounded-md border border-border bg-subtle/40 p-1">
                  <div className="text-[8px] text-foreground/60">{i + 1}</div>
                  {has && (
                    <span
                      className="mt-0.5 inline-block h-1 w-full rounded-full"
                      style={{ background: palette[i % palette.length] }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <p className="text-[10px] text-muted">Generated by GiriFlow</p>
            <p className="font-mono text-[10px] text-muted">giriflow.com</p>
          </div>
        </div>
      </div>

      {/* Share link card */}
      <div className="relative -mt-10 ml-auto w-full max-w-sm rotate-[2deg] overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-[0_30px_60px_-30px_rgba(14,47,100,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Share link</p>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-subtle/50 px-3 py-2 font-mono text-xs text-foreground/80">
          <span className="text-brand-600">🔗</span>
          giriflow.com/s/acme-may-2026
          <button className="ml-auto rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium text-background">
            Copy
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
          <Tag>View-only</Tag>
          <Tag>Password</Tag>
          <Tag>Expires 14d</Tag>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full border border-border bg-subtle/40 px-2 py-1 font-medium text-foreground/70">
      {children}
    </span>
  );
}
