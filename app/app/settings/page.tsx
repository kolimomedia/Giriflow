import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { loadWorkspaces } from "@/lib/active-workspace";
import { WorkspaceSettings } from "./workspace-settings";
import { ShareLinks } from "./share-links";
import type { ShareLink } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { list, active } = await loadWorkspaces();
  if (!active) return null;

  const isOwner = active.owner_id === user.id;

  const { data: members } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at")
    .eq("workspace_id", active.id);

  const { data: shares } = await supabase
    .from("share_links")
    .select("*")
    .eq("workspace_id", active.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            You're managing <strong>{active.name}</strong>. Use the workspace
            switcher in the sidebar to manage another.
          </p>
        </header>

        <WorkspaceSettings
          workspace={active}
          totalWorkspaces={list.length}
          isOwner={isOwner}
          memberCount={members?.length ?? 0}
        />

        <ShareLinks
          workspace={active}
          initial={(shares ?? []) as ShareLink[]}
        />

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Account
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="text-foreground/65">Email</dt>
            <dd className="font-mono">{user.email}</dd>
            <dt className="text-foreground/65">User ID</dt>
            <dd className="font-mono text-xs text-foreground/65">{user.id}</dd>
          </dl>
          <div className="mt-5">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground/85 hover:border-red-300 hover:text-red-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
