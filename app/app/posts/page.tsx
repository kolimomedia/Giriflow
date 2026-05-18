import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { loadWorkspaces } from "@/lib/active-workspace";
import { channelMeta, statusMeta } from "@/lib/channels";
import type { EnrichedPost, ReferenceLink } from "@/lib/types";

type SP = { q?: string };

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { active: workspace } = await loadWorkspaces();
  if (!workspace) return null;

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  let query = supabase
    .from("posts")
    .select("*, post_comments(count)")
    .eq("workspace_id", workspace.id)
    .order("scheduled_at", { ascending: false })
    .limit(200);

  if (q) {
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(`title.ilike.%${safe}%,caption.ilike.%${safe}%`);
  }

  const { data } = await query;
  const posts: EnrichedPost[] = (data ?? []).map((row) => {
    const { post_comments, ...rest } = row as Record<string, unknown> & {
      post_comments?: { count: number }[];
    };
    return {
      ...(rest as EnrichedPost),
      comments_count: post_comments?.[0]?.count ?? 0,
    };
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="mt-1 text-sm text-muted">
              {q ? (
                <>
                  Showing posts matching <strong>“{q}”</strong> in{" "}
                  <strong>{workspace.name}</strong>.
                </>
              ) : (
                <>
                  All posts in <strong>{workspace.name}</strong> — newest first.
                  Click a row to open it.
                </>
              )}
            </p>
          </div>
          <form className="flex items-center gap-2" role="search">
            <label htmlFor="posts-q" className="sr-only">
              Search posts
            </label>
            <input
              id="posts-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search posts…"
              className="h-10 w-56 rounded-full border border-border bg-surface px-4 text-sm placeholder:text-muted focus:border-brand-400"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background hover:bg-brand-700"
            >
              Search
            </button>
            {q && (
              <a
                href="/app/posts"
                className="text-xs text-muted hover:text-foreground"
              >
                Clear
              </a>
            )}
          </form>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center">
            <p className="text-sm text-muted">
              {q ? (
                <>
                  No posts match <strong>“{q}”</strong>. Try a different word.
                </>
              ) : (
                <>
                  No posts yet. Head to the{" "}
                  <Link
                    href="/app/calendar"
                    className="font-medium text-brand-700 underline"
                  >
                    calendar
                  </Link>{" "}
                  to add your first.
                </>
              )}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {posts.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PostRow({ post }: { post: EnrichedPost }) {
  const m = channelMeta[post.channel];
  const s = statusMeta[post.status];
  const linkCount = post.reference_links?.length ?? 0;
  const commentCount = post.comments_count ?? 0;
  return (
    <li className="group rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_15px_30px_-20px_rgba(14,47,100,0.35)]">
      <Link
        href={`/app/calendar?post=${post.id}`}
        className="block p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold uppercase"
              style={{ background: m.bg, color: m.text }}
              aria-label={m.label}
            >
              {m.short}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">
                {post.title || (
                  <span className="text-foreground/55">(no title)</span>
                )}
              </p>
              {post.caption && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                  {post.caption}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-foreground/65">
                <span className="font-mono">
                  {new Date(post.scheduled_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5"
                  style={{ background: `${s.dot}1a`, color: s.dot }}
                >
                  <span
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ background: s.dot }}
                  />
                  {s.label}
                </span>
                {commentCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-muted">
                    💬 {commentCount}
                  </span>
                )}
                {linkCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-muted">
                    🔗 {linkCount}
                  </span>
                )}
              </div>
            </div>
          </div>
          <span
            aria-hidden
            className="text-muted opacity-0 transition group-hover:opacity-100"
          >
            →
          </span>
        </div>
      </Link>

      {/* References live outside the Link so the anchors aren't nested. */}
      {linkCount > 0 && (
        <div className="border-t border-border px-4 py-3 sm:px-5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
            References
          </p>
          <ReferenceLinkChips links={post.reference_links} />
        </div>
      )}
    </li>
  );
}

/**
 * Server component — renders a row of clickable hostname chips. Wrapping
 * a <Link> in a <Link> isn't allowed, so each chip is a plain <a> and we
 * stopPropagation in the click handler isn't needed because <a> inside <a>
 * is handled by the browser (the inner anchor wins).
 */
export function ReferenceLinkChips({ links }: { links: ReferenceLink[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {links.map((link, idx) => (
        <li key={`${link.url}-${idx}`}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex max-w-[260px] items-center gap-1.5 rounded-full border border-border bg-subtle/40 px-2.5 py-1 text-[11px] text-foreground/80 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            title={link.url}
          >
            <span aria-hidden>🔗</span>
            <span className="truncate font-medium">
              {link.label || hostFromUrl(link.url)}
            </span>
            {link.label && (
              <span className="truncate text-[10px] text-muted">
                · {hostFromUrl(link.url)}
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
