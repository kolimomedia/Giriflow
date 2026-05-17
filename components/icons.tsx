type IconProps = { className?: string };

const base = "h-5 w-5";

export function CalendarIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3.5v3M16 3.5v3" />
      <circle cx="8" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DragIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="6" r="1.3" />
      <circle cx="15" cy="6" r="1.3" />
      <circle cx="9" cy="12" r="1.3" />
      <circle cx="15" cy="12" r="1.3" />
      <circle cx="9" cy="18" r="1.3" />
      <circle cx="15" cy="18" r="1.3" />
    </svg>
  );
}

export function ChannelsIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6.5" cy="7" r="2.5" />
      <circle cx="17.5" cy="7" r="2.5" />
      <circle cx="12" cy="17" r="2.5" />
      <path d="M8.5 8.5L11 15M15.5 8.5L13 15" />
    </svg>
  );
}

export function ApproveIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 5h12a3 3 0 013 3v6a3 3 0 01-3 3H9l-4 3v-3H4a0 0 0 010 0V5z" />
      <path d="M8.5 10.5l2 2 3.5-4" />
    </svg>
  );
}

export function LinkIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 10-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 105.66 5.66l1-1" />
    </svg>
  );
}

export function PdfIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5" />
      <path d="M9 14h6M9 17h4" />
    </svg>
  );
}

export const iconMap = {
  calendar: CalendarIcon,
  drag: DragIcon,
  channels: ChannelsIcon,
  approve: ApproveIcon,
  link: LinkIcon,
  pdf: PdfIcon,
} as const;

export type IconKey = keyof typeof iconMap;

/* Brand glyphs for channel marquee */

export function IgGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function TtGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 3c.4 2.4 1.9 4.3 4 4.7V11c-1.5 0-2.9-.4-4-1.1V15a5 5 0 11-5-5v3a2 2 0 102 2V3h3z" />
    </svg>
  );
}
export function LiGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <g fill="var(--background)">
        <circle cx="7.5" cy="8" r="1.4" />
        <rect x="6.3" y="10.4" width="2.4" height="7" rx=".3" />
        <path d="M11 10.4h2.2v1c.5-.7 1.4-1.2 2.5-1.2 2.1 0 3 1.2 3 3.6v4.6H16.4v-4c0-1-.4-1.7-1.4-1.7s-1.6.7-1.6 1.7v4h-2.4v-7z" />
      </g>
    </svg>
  );
}
export function YtGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 8c-.2-1.4-1-2.2-2.4-2.4C17.4 5.2 12 5.2 12 5.2s-5.4 0-7.6.4C3 5.8 2.2 6.6 2 8c-.2 1.4-.2 4-.2 4s0 2.6.2 4c.2 1.4 1 2.2 2.4 2.4 2.2.4 7.6.4 7.6.4s5.4 0 7.6-.4c1.4-.2 2.2-1 2.4-2.4.2-1.4.2-4 .2-4s0-2.6-.2-4z" />
      <path d="M10 9.2L15 12l-5 2.8z" fill="var(--background)" />
    </svg>
  );
}
export function XGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.5 3h3l-7 8.2L21 21h-6l-4.7-6.2L4.8 21H2l7.6-8.9L2 3h6l4.3 5.7L17.5 3z" />
    </svg>
  );
}
export function FbGlyph({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12a10 10 0 10-11.6 9.9V15h-2.5v-3h2.5V9.7c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 3h-2.3v6.9A10 10 0 0022 12z" />
    </svg>
  );
}
