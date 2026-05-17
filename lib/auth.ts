import "server-only";
import { cache } from "react";
import { getServerClient } from "./supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

/**
 * Per-request memoized lookup of the signed-in user (with display bits for
 * UI chrome like the marketing nav avatar). Returns null when signed out.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: (profile?.display_name as string | null) ?? null,
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
  };
});
