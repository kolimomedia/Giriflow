import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { loadWorkspaces } from "@/lib/active-workspace";
import { PrintCalendar } from "./print-calendar";
import type { Post } from "@/lib/types";

type SP = { month?: string };

export const metadata = { title: "Calendar — Print" };

export default async function PrintPage({
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
  const [yStr, mStr] = (sp.month ?? "").split("-");
  const now = new Date();
  const year = Number(yStr) || now.getUTCFullYear();
  const month0 = (Number(mStr) || now.getUTCMonth() + 1) - 1;
  const start = new Date(Date.UTC(year, month0, 1));
  const end = new Date(Date.UTC(year, month0 + 1, 1));

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("workspace_id", workspace.id)
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });

  return (
    <PrintCalendar
      workspaceName={workspace.name}
      year={year}
      month0={month0}
      posts={(posts ?? []) as Post[]}
    />
  );
}
