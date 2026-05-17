import { IgGlyph, TtGlyph, LiGlyph, YtGlyph, XGlyph, FbGlyph } from "./icons";

const items = [
  { name: "Instagram", Glyph: IgGlyph },
  { name: "TikTok", Glyph: TtGlyph },
  { name: "LinkedIn", Glyph: LiGlyph },
  { name: "YouTube", Glyph: YtGlyph },
  { name: "X", Glyph: XGlyph },
  { name: "Facebook", Glyph: FbGlyph },
  { name: "Threads", Glyph: IgGlyph },
  { name: "Pinterest", Glyph: YtGlyph },
];

export function ChannelMarquee() {
  const sequence = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div className="animate-marquee flex w-max items-center gap-10 py-2">
        {sequence.map(({ name, Glyph }, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-foreground/55"
          >
            <Glyph className="h-5 w-5" />
            <span className="text-sm font-medium tracking-tight">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
