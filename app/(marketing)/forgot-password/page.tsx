import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset the password on your GiriFlow account.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-noise opacity-50" aria-hidden />

      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-[0_30px_60px_-30px_rgba(14,47,100,0.35)] sm:p-10">
          <div className="flex flex-col items-center text-center">
            <LogoMark className="h-12 w-12" />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              Enter your email and we'll send a reset link.
            </p>
          </div>

          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-700 hover:text-brand-800"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
