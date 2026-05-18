import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center lg:px-10">
      <p className="font-mono text-xs uppercase tracking-widest text-brand-600">404</p>
      <h1 className="mt-4 text-balance text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
        That page isn't on the calendar.
      </h1>
      <p className="mt-5 max-w-xl text-foreground/70">
        Either it was rescheduled, archived, or never planned in the first place.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-brand-700"
      >
        Back to home
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
