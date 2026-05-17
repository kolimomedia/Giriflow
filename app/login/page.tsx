import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your GiriFlow workspace.",
};

export default function LoginPage() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-noise opacity-50" aria-hidden />

      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-[0_30px_60px_-30px_rgba(14,47,100,0.35)] sm:p-10">
          <div className="flex flex-col items-center text-center">
            <LogoMark className="h-12 w-12" />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              Welcome to GiriFlow
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              We'll email you a sign-in link. No password needed.
            </p>
          </div>

          <div className="mt-8">
            <Suspense
              fallback={
                <div className="h-12 w-full animate-pulse rounded-full bg-subtle" />
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-8 text-center text-xs text-muted">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              privacy policy
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/70">
          New to GiriFlow?{" "}
          <Link
            href="/#waitlist"
            className="font-medium text-brand-700 hover:text-brand-800"
          >
            Join the waitlist
          </Link>
        </p>
      </div>
    </section>
  );
}
