import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { loadWorkspaces } from "@/lib/active-workspace";
import { channelMeta, statusMeta } from "@/lib/channels";
import type { Post } from "@/lib/types";

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
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("scheduled_at", { ascending: false })
    .limit(200);

  if (q) {
    // Postgrest .or — case-insensitive title/caption match.
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(`title.ilike.%${safe}%,caption.ilike.%${safe}%`);
  }

  const { data } = await query;
  const posts = (data ?? []) as Post[];

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
                  <a
                    href="/app/calendar"
                    className="font-medium text-brand-700 underline"
                  >
                    calendar
                  </a>{" "}
                  to add your first.
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-subtle/50 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">
                <tr>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => {
                  const m = channelMeta[p.channel];
                  const s = statusMeta[p.status];
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ background: m.bg, color: m.text }}
                        >
                          {m.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.title || "(no title)"}</p>
                        {p.caption && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                            {p.caption}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {new Date(p.scheduled_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ background: s.dot }}
                          />
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
