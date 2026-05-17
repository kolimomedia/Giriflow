import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-aware Supabase client for Server Components, Server Actions and
 * Route Handlers. Uses the user's session cookie so RLS applies to the
 * authenticated user.
 */
export async function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — cookies are read-only there.
          // Safe to ignore; middleware will refresh on the next request.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS — only use in admin tasks or trusted
 * cron jobs. Never expose results directly to end users without filtering.
 */
let serviceCached: SupabaseClient | null = null;
export function getServiceClient(): SupabaseClient {
  if (serviceCached) return serviceCached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase server env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  serviceCached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serviceCached;
}
