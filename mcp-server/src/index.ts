#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "[giriflow-mcp] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

const ok = (data: unknown): ToolResult => ({
  content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
});

const fail = (message: string): ToolResult => ({
  content: [{ type: "text", text: `Error: ${message}` }],
  isError: true,
});

const server = new McpServer({ name: "giriflow", version: "0.1.0" });

server.registerTool(
  "list_workspaces",
  {
    title: "List workspaces",
    description:
      "List GiriFlow workspaces. Optionally filter by owner user id or by a case-insensitive name substring.",
    inputSchema: {
      owner_id: z
        .string()
        .uuid()
        .optional()
        .describe("Filter to workspaces owned by this user id."),
      name_contains: z
        .string()
        .min(1)
        .optional()
        .describe("Case-insensitive substring match on workspace name."),
      limit: z.number().int().min(1).max(200).default(50),
    },
  },
  async ({ owner_id, name_contains, limit }) => {
    let query = supabase
      .from("workspaces")
      .select("id, name, owner_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (owner_id) query = query.eq("owner_id", owner_id);
    if (name_contains) query = query.ilike("name", `%${name_contains}%`);

    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok(data ?? []);
  },
);

server.registerTool(
  "get_workspace",
  {
    title: "Get workspace",
    description: "Fetch a single workspace by id.",
    inputSchema: {
      id: z.string().uuid().describe("Workspace id."),
    },
  },
  async ({ id }) => {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, owner_id, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) return fail(error.message);
    if (!data) return fail(`Workspace ${id} not found.`);
    return ok(data);
  },
);

server.registerTool(
  "create_workspace",
  {
    title: "Create workspace",
    description:
      "Create a new GiriFlow workspace owned by the given user. Uses the service role, so no session is required.",
    inputSchema: {
      name: z
        .string()
        .min(1)
        .max(80)
        .describe("Workspace name (1-80 chars, will be trimmed)."),
      owner_id: z
        .string()
        .uuid()
        .describe("auth.users.id of the workspace owner."),
    },
  },
  async ({ name, owner_id }) => {
    const trimmed = name.trim().slice(0, 80);
    if (!trimmed) return fail("Workspace name is required.");

    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name: trimmed, owner_id })
      .select("id, name, owner_id, created_at")
      .single();

    if (error) return fail(error.message);
    return ok(data);
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[giriflow-mcp] ready on stdio");
