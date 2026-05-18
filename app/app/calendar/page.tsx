import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { loadWorkspaces } from "@/lib/active-workspace";
import { CalendarApp } from "./calendar-app";
import type { EnrichedPost } from "@/lib/types";

type SP = { month?: string; post?: string };

export default async function CalendarPage({
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
  if (!workspace) {
    return (
      <div className="p-10">
        <p className="text-sm text-muted">
          No workspace yet — try reloading.
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const [yStr, mStr] = (sp.month ?? "").split("-");
  const now = new Date();
  const year = Number(yStr) || now.getUTCFullYear();
  const month0 = (Number(mStr) || now.getUTCMonth() + 1) - 1;
  // Load a year-wide window so the year view + month nav are local.
  const windowStart = new Date(Date.UTC(year, 0, 1));
  const windowEnd = new Date(Date.UTC(year + 1, 0, 1));

  // Use Supabase's foreign-table count aggregate so each post comes with
  // its comments_count in a single round-trip.
  const { data } = await supabase
    .from("posts")
    .select("*, post_comments(count)")
    .eq("workspace_id", workspace.id)
    .gte("scheduled_at", windowStart.toISOString())
    .lt("scheduled_at", windowEnd.toISOString())
    .order("scheduled_at", { ascending: true });

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
    <CalendarApp
      workspace={workspace}
      initialPosts={posts}
      initialYear={year}
      initialMonth0={month0}
      openPostId={sp.post}
    />
  );
}
