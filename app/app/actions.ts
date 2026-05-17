"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerClient } from "@/lib/supabase/server";
import { ACTIVE_WS_COOKIE } from "@/lib/active-workspace";

const ONE_YEAR = 60 * 60 * 24 * 365;

// ── Workspaces ─────────────────────────────────────────────────────────

export async function setActiveWorkspace(id: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error("Workspace not found");

  const c = await cookies();
  c.set(ACTIVE_WS_COOKIE, id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });

  revalidatePath("/app");
}

export async function createWorkspace(name: string) {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) throw new Error("Workspace name is required");

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name: trimmed, owner_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const c = await cookies();
  c.set(ACTIVE_WS_COOKIE, data.id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });

  revalidatePath("/app");
  return data;
}

export async function renameWorkspace(id: string, name: string) {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) throw new Error("Name is required");
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ name: trimmed })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

export async function deleteWorkspace(id: string) {
  const supabase = await getServerClient();
  const { count } = await supabase
    .from("workspaces")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    throw new Error("You need at least one workspace.");
  }

  const { error } = await supabase.from("workspaces").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const c = await cookies();
  if (c.get(ACTIVE_WS_COOKIE)?.value === id) {
    c.delete(ACTIVE_WS_COOKIE);
  }

  revalidatePath("/app");
  redirect("/app");
}

// ── Profile ────────────────────────────────────────────────────────────

export async function updateProfile(input: {
  display_name?: string | null;
  avatar_url?: string | null;
  timezone?: string;
}) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const patch: Record<string, unknown> = {};
  if (input.display_name !== undefined)
    patch.display_name = input.display_name?.trim().slice(0, 80) || null;
  if (input.avatar_url !== undefined)
    patch.avatar_url = input.avatar_url?.trim().slice(0, 500) || null;
  if (input.timezone !== undefined) patch.timezone = input.timezone;

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/app");
}

// ── Share links ────────────────────────────────────────────────────────

function randomToken(len = 24): string {
  // URL-safe base64 of crypto random bytes.
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
}

export async function createShareLink(input: {
  workspace_id: string;
  name?: string;
  allow_comments?: boolean;
  expires_in_days?: number | null;
}) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const token = randomToken(20);
  const expires_at =
    input.expires_in_days && input.expires_in_days > 0
      ? new Date(Date.now() + input.expires_in_days * 86400_000).toISOString()
      : null;

  const { data, error } = await supabase
    .from("share_links")
    .insert({
      workspace_id: input.workspace_id,
      token,
      name: input.name?.trim().slice(0, 80) || "Untitled link",
      allow_comments: !!input.allow_comments,
      expires_at,
      created_by: user.id,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/app/settings");
  return data;
}

export async function deleteShareLink(id: string) {
  const supabase = await getServerClient();
  const { error } = await supabase.from("share_links").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/settings");
}
