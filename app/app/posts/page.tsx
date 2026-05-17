import { getServerClient } from "@/lib/supabase/server";
import { channelMeta, statusMeta } from "@/lib/channels";
import type { Post } from "@/lib/types";

export default async function PostsPage() {
  const supabase = await getServerClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("scheduled_at", { ascending: false })
    .limit(100);
  const posts = (data ?? []) as Post[];

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="mt-1 text-sm text-muted">
              Everything scheduled, drafted, or shipped — newest first.
            </p>
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center">
            <p className="text-sm text-muted">
              No posts yet. Head to the{" "}
              <a href="/app/calendar" className="font-medium text-brand-700 underline">
                calendar
              </a>{" "}
              to add your first.
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
