"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import { channelIds, statusIds, type ChannelId, type PostStatus } from "@/lib/channels";

type CreateInput = {
  workspace_id: string;
  channel: string;
  title: string;
  caption: string;
  scheduled_at: string;
  status: string;
};

type UpdateInput = CreateInput & { id: string };

function normalize(input: CreateInput) {
  if (!channelIds.includes(input.channel as ChannelId)) {
    throw new Error(`Invalid channel: ${input.channel}`);
  }
  if (!statusIds.includes(input.status as PostStatus)) {
    throw new Error(`Invalid status: ${input.status}`);
  }
  return {
    workspace_id: input.workspace_id,
    channel: input.channel as ChannelId,
    title: input.title.trim().slice(0, 200),
    caption: input.caption.trim().slice(0, 5000),
    scheduled_at: input.scheduled_at,
    status: input.status as PostStatus,
  };
}

export async function createPost(input: CreateInput) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const row = normalize(input);
  const { data, error } = await supabase
    .from("posts")
    .insert({ ...row, created_by: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/app/calendar");
  return data;
}

export async function updatePost(input: UpdateInput) {
  const supabase = await getServerClient();
  const row = normalize(input);
  const { data, error } = await supabase
    .from("posts")
    .update(row)
    .eq("id", input.id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/app/calendar");
  return data;
}

export async function deletePost(id: string) {
  const supabase = await getServerClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/app/calendar");
}

/** Drag-drop: move a post to a new date, preserve its time-of-day. */
export async function reschedulePost(id: string, newDateYmd: string) {
  const supabase = await getServerClient();
  const { data: existing, error: e1 } = await supabase
    .from("posts")
    .select("scheduled_at")
    .eq("id", id)
    .single();
  if (e1) throw new Error(e1.message);

  const t = new Date(existing.scheduled_at as string);
  const [y, m, d] = newDateYmd.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d, t.getUTCHours(), t.getUTCMinutes(), 0));

  const { data, error } = await supabase
    .from("posts")
    .update({ scheduled_at: next.toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/app/calendar");
  return data;
}

export async function approvePost(id: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("posts")
    .update({ status: "approved" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/app/calendar");
  return data;
}

// ── Comments ───────────────────────────────────────────────────────────

export async function listComments(postId: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createComment(postId: string, body: string) {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = body.trim().slice(0, 4000);
  if (!trimmed) throw new Error("Comment can't be empty");

  const { data, error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, author_id: user.id, body: trimmed })
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/app/calendar");
  return data;
}

export async function deleteComment(id: string) {
  const supabase = await getServerClient();
  const { error } = await supabase.from("post_comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/calendar");
}
