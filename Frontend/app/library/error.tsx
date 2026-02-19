"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Shared error boundary for library routes.
 * Catches fetch errors (e.g. backend unavailable) and 404s.
 */
export default function LibraryError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col justify-center items-center gap-4 p-6 min-h-[60vh] text-center">
      <AlertCircle className="size-10 text-destructive" />
      <div className="space-y-1">
        <h2 className="font-semibold text-lg">Something went wrong</h2>
        <p className="max-w-sm text-muted-foreground text-sm">
          {error.message ?? "Failed to load content. The server may be unavailable."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button asChild>
          <Link href="/library">Back to Library</Link>
        </Button>
      </div>
    </div>
  );
}
