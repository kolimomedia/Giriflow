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
        <span className="text-[19px] font-semibold tracking-tight">
          Giri<span className="text-brand-600 italic">Flow</span>
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="var(--brand-500)" />
      {/* Stylised G + flow line, echoing the GiriBooks mark */}
      <path
        d="M22 10c-1.6-1.2-3.6-1.9-5.8-1.9-4.7 0-8.5 3.8-8.5 8.5s3.8 8.5 8.5 8.5c4.3 0 7.8-3.2 8.4-7.3h-8.5v-2.6h11c.1.5.2 1.1.2 1.7 0 6.3-5.1 11.4-11.5 11.4S4.5 23.3 4.5 17s5-11.4 11.4-11.4c2.7 0 5.2.9 7.2 2.5L22 10z"
        fill="white"
      />
      <path
        d="M9 26c2.5 1.2 5.5 1.6 8 .8 2.5-.8 4.5-2.6 7-3"
        stroke="white"
        strokeOpacity=".55"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
