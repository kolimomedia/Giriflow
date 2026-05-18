import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerClient } from "@/lib/supabase/server";
import { GuestCalendar, type GuestComment, type GuestLink } from "./guest-calendar";
import { LogoMark } from "@/components/logo";
import type { Post, Workspace } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = { month?: string };

type SharePayload =
  | null
  | { expired: true }
  | {
      workspace: Workspace;
      link: GuestLink;
      posts: Post[];
      comments: GuestComment[];
    };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Shared calendar",
    robots: { index: false, follow: false },
  };
}

export default async function SharedCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<SP>;
}) {
  const { token } = await params;
  const sp = await searchParams;

  const supabase = await getServerClient();
  const { data } = await supabase.rpc("get_share_payload", { p_token: token });
  const payload = data as SharePayload;

  if (!payload) notFound();
  if ("expired" in payload) return <ExpiredView />;

  const { workspace, posts, comments, link } = payload;

  const [yStr, mStr] = (sp.month ?? "").split("-");
  const now = new Date();
  const year = Number(yStr) || now.getUTCFullYear();
  const month0 = (Number(mStr) || now.getUTCMonth() + 1) - 1;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <LogoMark className="h-7 w-7" />
            <div>
              <p className="text-sm font-semibold leading-tight">{workspace.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted">
                Shared via GiriFlow · read-only
                {link.allow_comments ? " · comments open" : ""}
              </p>
            </div>
          </div>
          <a
            href="/"
            className="text-xs font-medium text-foreground/70 hover:text-brand-700"
          >
            About GiriFlow →
          </a>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8">
        <GuestCalendar
          token={token}
          posts={posts}
          comments={comments}
          link={link}
          initialYear={year}
          initialMonth0={month0}
          workspaceName={workspace.name}
        />
      </main>

      <footer className="border-t border-border bg-subtle/40">
        <div className="mx-auto max-w-6xl px-6 py-4 text-center text-[11px] text-muted">
          You're viewing a read-only share. Plan your own at{" "}
          <a href="/" className="font-medium text-brand-700 hover:text-brand-800">
            giriflow.com
          </a>
          .
        </div>
      </footer>
    </div>
  );
}

function ExpiredView() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-8">
      <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="mt-6 text-xl font-semibold tracking-tight">
          This share link has expired
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Ask whoever shared it with you to send a fresh one.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-brand-700"
        >
          Visit GiriFlow
        </a>
      </div>
    </div>
  );
}
