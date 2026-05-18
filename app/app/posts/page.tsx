import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { loadWorkspaces } from "@/lib/active-workspace";
import { channelIds, statusIds, type ChannelId, type PostStatus } from "@/lib/channels";
import { PostsBrowser, type SortKey, SORT_KEYS } from "./posts-browser";
import type { EnrichedPost } from "@/lib/types";

type SP = {
  q?: string;
  sort?: string;
  channel?: string;
  status?: string;
};

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
  const sort: SortKey = SORT_KEYS.includes(sp.sort as SortKey)
    ? (sp.sort as SortKey)
    : "scheduled-desc";
  const channelFilter = channelIds.includes(sp.channel as ChannelId)
    ? (sp.channel as ChannelId)
    : null;
  const statusFilter = statusIds.includes(sp.status as PostStatus)
    ? (sp.status as PostStatus)
    : null;

  let query = supabase
    .from("posts")
    .select("*, post_comments(count)")
    .eq("workspace_id", workspace.id)
    .limit(300);

  // Sorting
  switch (sort) {
    case "scheduled-asc":
      query = query.order("scheduled_at", { ascending: true });
      break;
    case "created-desc":
      query = query.order("created_at", { ascending: false });
      break;
    case "updated-desc":
      query = query.order("updated_at", { ascending: false });
      break;
    case "scheduled-desc":
    default:
      query = query.order("scheduled_at", { ascending: false });
      break;
  }

  if (q) {
    const safe = q.replace(/[%,]/g, " ");
    query = query.or(`title.ilike.%${safe}%,caption.ilike.%${safe}%`);
  }
  if (channelFilter) query = query.eq("channel", channelFilter);
  if (statusFilter) query = query.eq("status", statusFilter);

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
    <PostsBrowser
      posts={posts}
      workspaceName={workspace.name}
      initialQ={q}
      initialSort={sort}
      initialChannel={channelFilter}
      initialStatus={statusFilter}
    />
  );
}
