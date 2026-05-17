import "server-only";
import { cookies } from "next/headers";
import { getServerClient } from "@/lib/supabase/server";
import type { Workspace } from "@/lib/types";

export const ACTIVE_WS_COOKIE = "giriflow_ws";

/**
 * Loads all workspaces the user can see and picks the active one based on
 * the `giriflow_ws` cookie (falling back to the first workspace). Returns
 * an empty list and null when the user has none.
 */
export async function loadWorkspaces(): Promise<{
  list: Workspace[];
  active: Workspace | null;
}> {
  const supabase = await getServerClient();
  const { data } = await supabase
    .from("workspaces")
    .select("id, name, owner_id, created_at")
    .order("created_at", { ascending: true });
  const list = (data ?? []) as Workspace[];

  if (list.length === 0) {
    return { list, active: null };
  }

  const c = await cookies();
  const cookieId = c.get(ACTIVE_WS_COOKIE)?.value;
  const active = list.find((w) => w.id === cookieId) ?? list[0];
  return { list, active };
}
