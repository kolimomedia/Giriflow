export const channelMeta = {
  instagram: { label: "Instagram", short: "IG", color: "#d946ef", bg: "#fdf4ff", text: "#86198f" },
  tiktok:    { label: "TikTok",    short: "TT", color: "#0ea5e9", bg: "#f0f9ff", text: "#0369a1" },
  linkedin:  { label: "LinkedIn",  short: "LI", color: "#2563eb", bg: "#eff6ff", text: "#1e40af" },
  youtube:   { label: "YouTube",   short: "YT", color: "#ef4444", bg: "#fef2f2", text: "#991b1b" },
  x:         { label: "X",         short: "X",  color: "#0f172a", bg: "#f1f5f9", text: "#0f172a" },
  facebook:  { label: "Facebook",  short: "FB", color: "#1d4ed8", bg: "#eef4ff", text: "#1e3a8a" },
  threads:   { label: "Threads",   short: "TH", color: "#0c0a09", bg: "#f5f5f4", text: "#1c1917" },
} as const;

export type ChannelId = keyof typeof channelMeta;
export const channelIds = Object.keys(channelMeta) as ChannelId[];

export const statusMeta = {
  draft:     { label: "Draft",     dot: "#f59e0b" },
  approved:  { label: "Approved",  dot: "#1f74f1" },
  scheduled: { label: "Scheduled", dot: "#0ea5e9" },
  published: { label: "Published", dot: "#0d522e" },
} as const;

export type PostStatus = keyof typeof statusMeta;
export const statusIds = Object.keys(statusMeta) as PostStatus[];
