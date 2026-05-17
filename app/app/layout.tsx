import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { loadWorkspaces } from "@/lib/active-workspace";
import type { Profile, Workspace } from "@/lib/types";

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

  let { list, active } = await loadWorkspaces();

  // Defensive fallback if the signup trigger never ran.
  if (!active) {
    const { data: ws } = await supabase
      .from("workspaces")
      .insert({ name: "My workspace", owner_id: user.id })
      .select()
      .single();
    active = ws as Workspace;
    list = [active];
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <AppShell
      user={{ id: user.id, email: user.email ?? "" }}
      profile={(profile as Profile | null) ?? null}
      workspace={active}
      workspaces={list}
    >
      {children}
    </AppShell>
  );
}
