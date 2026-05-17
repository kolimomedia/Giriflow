import Link from "next/link";

type Variant = "default" | "mark";

export function Logo({
  variant = "default",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="GiriFlow — home"
    >
      <LogoMark className="h-7 w-7" />
      {variant === "default" && (
        <span className="text-[19px] font-semibold tracking-tight text-foreground">
          Giri<span className="text-brand-500 italic">Flow</span>
        </span>
      )}
    </Link>
  );
}

/**
 * GiriFlow mark — a stylised G+F monogram with a flow tail.
 * The shape is custom-drawn; the gradient is brand cyan → royal blue.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <linearGradient id="gf-grad" x1="6" y1="8" x2="58" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset=".55" stopColor="#1f74f1" />
          <stop offset="1" stopColor="#114aa9" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#gf-grad)" />
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M40 22c-2.2-2.3-5.4-3.7-9-3.7-7.5 0-13.5 6-13.5 13.5S23.5 45.3 31 45.3c4.6 0 8.6-2.3 11-5.8" />
        <path d="M42 32H31" />
        <path d="M44 18v28" />
        <path d="M44 18h7" />
        <path d="M44 31h6" />
        <path
          d="M18 50c3 1.4 7 1.6 11 .4 4-1.2 7-3.4 11-3.4"
          strokeOpacity=".55"
          strokeWidth="2.6"
        />
      </g>
    </svg>
  );
}

/**
 * Flat mark suitable for printing on light surfaces — gradient on transparent,
 * no rounded square. Used in the calendar PDF mock and the OG image.
 */
export function LogoMarkFlat({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <linearGradient id="gf-flat" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset=".6" stopColor="#1f74f1" />
          <stop offset="1" stopColor="#0e2f64" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="url(#gf-flat)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M40 22c-2.2-2.3-5.4-3.7-9-3.7-7.5 0-13.5 6-13.5 13.5S23.5 45.3 31 45.3c4.6 0 8.6-2.3 11-5.8" />
        <path d="M42 32H31" />
        <path d="M44 18v28" />
        <path d="M44 18h7" />
        <path d="M44 31h6" />
      </g>
    </svg>
  );
}
