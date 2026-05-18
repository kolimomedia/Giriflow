import Image from "next/image";
import Link from "next/link";

type Variant = "default" | "mark";

const MARK_SRC = "/giriflow-mark-square.png";
const WORDMARK_SRC = "/giriflow-wordmark.png";

/**
 * Branded logo used in marketing nav, footer, sidebar, login pages.
 * `default` shows mark + GiriFlow wordmark; `mark` shows just the GF mark.
 */
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
 * GF brand mark — the gradient cyan→royal-blue monogram.
 * Sized via className (e.g. h-7 w-7); image is square.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  // Default a sensible pixel size when className doesn't constrain it.
  // The PNG is 512×512, next/image picks the right resolution.
  return (
    <span className={`relative inline-block ${className || "h-8 w-8"}`}>
      <Image
        src={MARK_SRC}
        alt=""
        fill
        sizes="64px"
        className="object-contain"
        priority
      />
    </span>
  );
}

/**
 * Flat mark for print contexts (PDF export) — same source asset, just
 * sized via className.
 */
export function LogoMarkFlat({ className = "" }: { className?: string }) {
  return <LogoMark className={className} />;
}

/**
 * Full wordmark (mark + GiriFlow). Use where there's horizontal space
 * — e.g. login page, footer, hero.
 */
export function LogoWordmark({
  className = "",
  width = 200,
}: {
  className?: string;
  width?: number;
}) {
  // PNG is 1200×320 (ratio ≈ 3.75:1).
  const height = Math.round(width / 3.75);
  return (
    <Image
      src={WORDMARK_SRC}
      alt="GiriFlow"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
