import type { ChannelId, PostStatus } from "./channels";

export type Workspace = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export type Post = {
  id: string;
  workspace_id: string;
  channel: ChannelId;
  title: string;
  caption: string;
  scheduled_at: string;
  status: PostStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};
