import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-muted">
            How you show up across your workspaces.
          </p>
        </header>

        <ProfileForm initial={profile as Profile} email={user.email ?? ""} />
      </div>
    </div>
  );
}
