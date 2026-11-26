import type { Metadata } from "next";
import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Maintenance — Axonelix",
  description: "Axonelix is temporarily offline for maintenance.",
};

export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      {/* subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 45%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="flex size-20 items-center justify-center rounded-3xl border border-border bg-card shadow-sm">
            <Construction className="size-9 text-muted-foreground" />
          </div>
          <span className="absolute -right-2 -top-2 flex size-4">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex size-4 rounded-full border-2 border-background bg-amber-400" />
          </span>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Temporary outage
        </p>
        <h1 className="max-w-md text-3xl font-bold tracking-tight sm:text-4xl">
          We&apos;ll be right back
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
          Axonelix is down for scheduled maintenance. Our team is working on it —
          please check back soon.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
