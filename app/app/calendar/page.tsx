import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { CalendarApp } from "./calendar-app";
import type { Post, Workspace } from "@/lib/types";

type SP = { month?: string };

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

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, owner_id, created_at")
    .order("created_at", { ascending: true })
    .limit(1);

  const workspace = (workspaces?.[0] ?? null) as Workspace | null;
  if (!workspace) {
    return (
      <div className="p-10">
        <p className="text-sm text-muted">
          No workspace yet — try reloading. If this persists, contact{" "}
          <a href="mailto:hello@giriflow.com" className="underline">
            support
          </a>
          .
        </p>
      </div>
    );
  }

  // Load a generous window so navigating ±1 month doesn't require a refetch.
  const sp = await searchParams;
  const [yStr, mStr] = (sp.month ?? "").split("-");
  const now = new Date();
  const year = Number(yStr) || now.getUTCFullYear();
  const month0 = (Number(mStr) || now.getUTCMonth() + 1) - 1;
  const windowStart = new Date(Date.UTC(year, month0 - 1, 1));
  const windowEnd = new Date(Date.UTC(year, month0 + 2, 1));

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("workspace_id", workspace.id)
    .gte("scheduled_at", windowStart.toISOString())
    .lt("scheduled_at", windowEnd.toISOString())
    .order("scheduled_at", { ascending: true });

  return (
    <CalendarApp
      workspace={workspace}
      initialPosts={(posts ?? []) as Post[]}
      initialYear={year}
      initialMonth0={month0}
    />
  );
}
