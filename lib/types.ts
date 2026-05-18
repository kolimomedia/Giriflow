import type { ChannelId, PostStatus } from "./channels";

export type Workspace = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export type ReferenceLink = {
  url: string;
  label?: string;
};

export type Post = {
  id: string;
  workspace_id: string;
  channel: ChannelId;
  title: string;
  caption: string;
  scheduled_at: string;
  status: PostStatus;
  reference_links: ReferenceLink[];
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type PostComment = {
  id: string;
  post_id: string;
  author_id: string | null;
  author_label: string | null;
  body: string;
  created_at: string;
};

export type ShareLink = {
  id: string;
  workspace_id: string;
  token: string;
  name: string;
  created_by: string;
  expires_at: string | null;
  allow_comments: boolean;
  last_viewed_at: string | null;
  created_at: string;
};
