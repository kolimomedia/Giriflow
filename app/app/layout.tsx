import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app/sidebar";
import type { Workspace } from "@/lib/types";

export const metadata = {
  title: "App",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pull the user's workspaces (RLS scopes this automatically).
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, owner_id, created_at")
    .order("created_at", { ascending: true });

  const list = (workspaces ?? []) as Workspace[];

  // The signup trigger should have created a workspace already, but fall
  // back gracefully if it didn't.
  let activeWorkspace = list[0];
  if (!activeWorkspace) {
    const { data: ws } = await supabase
      .from("workspaces")
      .insert({ name: "My workspace", owner_id: user.id })
      .select()
      .single();
    activeWorkspace = ws as Workspace;
  }

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar
        user={{ id: user.id, email: user.email ?? "" }}
        workspace={activeWorkspace}
        workspaces={list}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
