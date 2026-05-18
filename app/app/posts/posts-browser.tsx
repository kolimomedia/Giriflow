"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { channelMeta, channelIds, statusMeta, statusIds, type ChannelId, type PostStatus } from "@/lib/channels";
import type { EnrichedPost } from "@/lib/types";
import { PostPreviewModal } from "./post-preview-modal";
import { SORT_KEYS, SORT_LABELS, type SortKey } from "./sort-keys";

type Props = {
  posts: EnrichedPost[];
  workspaceName: string;
  initialQ: string;
  initialSort: SortKey;
  initialChannel: ChannelId | null;
  initialStatus: PostStatus | null;
};

export function PostsBrowser({
  posts,
  workspaceName,
  initialQ,
  initialSort,
  initialChannel,
  initialStatus,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);
  const [preview, setPreview] = useState<EnrichedPost | null>(null);

  const updateUrl = useCallback(
    (patch: {
      q?: string | null;
      sort?: SortKey | null;
      channel?: ChannelId | null;
      status?: PostStatus | null;
    }) => {
      const params = new URLSearchParams();
      const nextQ = patch.q !== undefined ? patch.q : initialQ;
      const nextSort = patch.sort !== undefined ? patch.sort : initialSort;
      const nextChannel =
        patch.channel !== undefined ? patch.channel : initialChannel;
      const nextStatus =
        patch.status !== undefined ? patch.status : initialStatus;
      if (nextQ) params.set("q", nextQ);
      if (nextSort && nextSort !== "scheduled-desc") params.set("sort", nextSort);
      if (nextChannel) params.set("channel", nextChannel);
      if (nextStatus) params.set("status", nextStatus);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `/app/posts?${qs}` : "/app/posts");
      });
    },
    [router, initialQ, initialSort, initialChannel, initialStatus],
  );

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateUrl({ q: q.trim() || null });
  }

  const hasFilters =
    Boolean(initialQ) || initialChannel || initialStatus;

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="mt-1 text-sm text-muted">
              {posts.length} post{posts.length === 1 ? "" : "s"} in{" "}
              <strong>{workspaceName}</strong>
              {pending && <span className="ml-2 text-muted">…</span>}
            </p>
          </div>
          <form onSubmit={onSubmitSearch} className="flex items-center gap-2" role="search">
            <label htmlFor="posts-q" className="sr-only">
              Search posts
            </label>
            <input
              id="posts-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search posts…"
              className="h-10 w-56 rounded-full border border-border bg-surface px-4 text-sm placeholder:text-muted focus:border-brand-400"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-brand-700"
            >
              Search
            </button>
          </form>
        </header>

        {/* Toolbar — sort + filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <label htmlFor="posts-sort" className="text-[11px] font-semibold uppercase tracking-widest text-muted">
            Sort
          </label>
          <select
            id="posts-sort"
            value={initialSort}
            onChange={(e) => updateUrl({ sort: e.target.value as SortKey })}
            className="h-9 rounded-full border border-border bg-surface px-3 text-xs focus:border-brand-400"
          >
            {SORT_KEYS.map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>

          <span className="mx-1 hidden h-6 w-px bg-border sm:inline-block" />

          <FilterChip
            label="All channels"
            active={!initialChannel}
            onClick={() => updateUrl({ channel: null })}
          />
          {channelIds.map((c) => {
            const m = channelMeta[c];
            const active = initialChannel === c;
            return (
              <FilterChip
                key={c}
                label={m.label}
                color={m.color}
                bg={m.bg}
                text={m.text}
                active={active}
                onClick={() => updateUrl({ channel: active ? null : c })}
              />
            );
          })}

          <span className="mx-1 hidden h-6 w-px bg-border sm:inline-block" />

          <FilterChip
            label="Any status"
            active={!initialStatus}
            onClick={() => updateUrl({ status: null })}
          />
          {statusIds.map((s) => {
            const m = statusMeta[s];
            const active = initialStatus === s;
            return (
              <FilterChip
                key={s}
                label={m.label}
                color={m.dot}
                active={active}
                onClick={() => updateUrl({ status: active ? null : s })}
              />
            );
          })}

          {hasFilters && (
            <Link
              href="/app/posts"
              className="ml-auto text-xs text-muted underline hover:text-foreground"
            >
              Clear all
            </Link>
          )}
        </div>

        {/* Grid */}
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center">
            <p className="text-sm text-muted">
              {hasFilters ? (
                <>
                  No posts match those filters.{" "}
                  <Link href="/app/posts" className="font-medium text-brand-700 underline">
                    Clear them
                  </Link>{" "}
                  to see everything.
                </>
              ) : (
                <>
                  No posts yet. Head to the{" "}
                  <Link href="/app/calendar" className="font-medium text-brand-700 underline">
                    calendar
                  </Link>{" "}
                  to add your first.
                </>
              )}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard post={p} onOpen={() => setPreview(p)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {preview && (
        <PostPreviewModal
          post={preview}
          onClose={() => setPreview(null)}
          onEdit={() => {
            router.push(`/app/calendar?post=${preview.id}`);
          }}
        />
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color,
  bg,
  text,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
  bg?: string;
  text?: string;
}) {
  if (active && (bg || color)) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium"
        style={{
          background: bg ?? `${color}1a`,
          color: text ?? color ?? "var(--foreground)",
          boxShadow: color ? `inset 0 0 0 1px ${color}66` : undefined,
        }}
      >
        {color && <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition",
        active
          ? "border-brand-500 bg-brand-50 text-brand-800"
          : "border-border bg-surface text-foreground/70 hover:border-brand-300 hover:text-brand-700",
      ].join(" ")}
    >
      {color && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
      {label}
    </button>
  );
}

function PostCard({ post, onOpen }: { post: EnrichedPost; onOpen: () => void }) {
  const m = channelMeta[post.channel];
  const s = statusMeta[post.status];
  const linkCount = post.reference_links?.length ?? 0;
  const commentCount = post.comments_count ?? 0;
  const scheduled = new Date(post.scheduled_at);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_25px_50px_-30px_rgba(14,47,100,0.4)]"
    >
      {/* Visual band — channel-tinted gradient placeholder, doubles as the
          "image slot" until we add real attachments. */}
      <div
        className="relative h-28 w-full"
        style={{
          background: `linear-gradient(135deg, ${m.color}22, ${m.color}05 70%)`,
        }}
      >
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: m.bg, color: m.text }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
          {m.label}
        </span>
        <span
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: `${s.dot}1a`, color: s.dot }}
        >
          <span className="inline-block h-1 w-1 rounded-full" style={{ background: s.dot }} />
          {s.label}
        </span>
        {/* Big channel mark watermark */}
        <span
          className="pointer-events-none absolute bottom-2 right-3 select-none text-[44px] font-bold leading-none"
          style={{ color: `${m.color}26` }}
          aria-hidden
        >
          {m.short}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {scheduled.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          {" · "}
          {scheduled.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </p>
        <h3 className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
          {post.title || (
            <span className="text-foreground/55">(no title)</span>
          )}
        </h3>
        {post.caption && (
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-foreground/70">
            {post.caption}
          </p>
        )}

        {linkCount > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1">
            {post.reference_links.slice(0, 2).map((link, idx) => (
              <li key={`${link.url}-${idx}`}>
                <span className="inline-flex max-w-[140px] items-center gap-1 rounded-full bg-subtle/60 px-2 py-0.5 text-[10px] text-foreground/70">
                  <span aria-hidden>🔗</span>
                  <span className="truncate">
                    {link.label || hostFromUrl(link.url)}
                  </span>
                </span>
              </li>
            ))}
            {linkCount > 2 && (
              <li>
                <span className="inline-flex items-center rounded-full bg-subtle/60 px-2 py-0.5 text-[10px] text-foreground/70">
                  +{linkCount - 2}
                </span>
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px] text-muted">
          <div className="flex items-center gap-3">
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1">
                💬 {commentCount}
              </span>
            )}
            {linkCount > 0 && (
              <span className="inline-flex items-center gap-1">
                🔗 {linkCount}
              </span>
            )}
          </div>
          <span
            aria-hidden
            className="text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
          >
            Preview →
          </span>
        </div>
      </div>
    </button>
  );
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
