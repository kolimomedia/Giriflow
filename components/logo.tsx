import Image from "next/image";
import Link from "next/link";

type Variant = "default" | "mark";

const MARK_SRC = "/giriflow-mark-square.png";
const WORDMARK_SRC = "/giriflow-wordmark.png";

// Wordmark PNG natural ratio = 1200 × 320 (3.75:1).
const WORDMARK_RATIO = 3.75;

/**
 * Branded GiriFlow logo for the main header / footer / sidebar / print
 * surfaces. Renders the actual wordmark PNG (mark + "GiriFlow") so the
 * brand is consistent and we never reconstruct it from text.
 *
 * Use `variant="mark"` for tight spaces that only fit the icon
 * (favicon, auth card avatars, mobile app icon strips, etc.).
 */
export function Logo({
  variant = "default",
  className = "",
  width = 140,
}: {
  variant?: Variant;
  className?: string;
  /** Wordmark width in px. Ignored when variant="mark". */
  width?: number;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center ${className}`}
      aria-label="GiriFlow — home"
    >
      {variant === "mark" ? (
        <LogoMark className="h-7 w-7" />
      ) : (
        <LogoWordmark width={width} />
      )}
    </Link>
  );
}

/**
 * Icon-only GF mark. Sized via className (square).
 * Use for favicon, app icon, centered auth cards, etc.
 */
export function LogoMark({ className = "" }: { className?: string }) {
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

/** Alias kept for the print export (same asset, no special flat treatment). */
export function LogoMarkFlat({ className = "" }: { className?: string }) {
  return <LogoMark className={className} />;
}

/**
 * Full GiriFlow wordmark — mark + lockup. Sized by `width` in px
 * (height computed from the PNG's 3.75:1 ratio).
 */
export function LogoWordmark({
  className = "",
  width = 200,
  priority = true,
}: {
  className?: string;
  width?: number;
  priority?: boolean;
}) {
  const height = Math.round(width / WORDMARK_RATIO);
  return (
    <Image
      src={WORDMARK_SRC}
      alt="GiriFlow"
      width={width}
      height={height}
      className={className}
      priority={priority}
      style={{ width, height: "auto" }}
    />
  );
}
