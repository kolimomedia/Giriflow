import Link from "next/link";
import { Logo } from "./logo";
import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-subtle/40">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {site.description}
            </p>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted">
              {site.family.label}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {site.family.siblings.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 hover:border-brand-300 hover:text-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {s.name}
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", href: "/#features" },
              { label: "How it works", href: "/#how-it-works" },
              { label: "Collaboration", href: "/#collaboration" },
              { label: "Pricing", href: "/pricing" },
              { label: "Changelog", href: "/changelog" },
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ]}
          />

          <FooterCol
            title="Connect"
            links={[
              { label: "Instagram", href: site.social.instagram },
              { label: "X", href: site.social.x },
              { label: "LinkedIn", href: site.social.linkedin },
              { label: site.contact.email, href: `mailto:${site.contact.email}` },
            ]}
          />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p className="font-mono">{site.domain}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-foreground/80 transition hover:text-brand-700"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
