// Tiny shared module so both the server page and the "use client"
// posts-browser can read SORT_KEYS without crossing the client/server
// boundary (Next.js replaces values imported from "use client" files
// with serializable client references, breaking .includes() etc.).

export const SORT_KEYS = [
  "scheduled-desc",
  "scheduled-asc",
  "created-desc",
  "updated-desc",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Record<SortKey, string> = {
  "scheduled-desc": "Scheduled · latest first",
  "scheduled-asc": "Scheduled · earliest first",
  "created-desc": "Recently added",
  "updated-desc": "Recently updated",
};
