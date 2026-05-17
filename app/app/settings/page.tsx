import { getServerClient } from "@/lib/supabase/server";
import type { Workspace } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });
  const list = (workspaces ?? []) as Workspace[];

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Workspace and account details.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Account
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="text-foreground/65">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
            <dt className="text-foreground/65">User ID</dt>
            <dd className="font-mono text-xs text-foreground/70">{user?.id}</dd>
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Workspaces
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {list.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{w.name}</p>
                  <p className="text-xs text-muted">
                    Created {new Date(w.created_at).toLocaleDateString()}
                    {w.owner_id === user?.id ? " · owner" : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            Sign out
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            Ends your session on this device.
          </p>
          <form action="/auth/signout" method="post" className="mt-4">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground/85 hover:border-red-300 hover:text-red-700"
            >
              Sign out
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
