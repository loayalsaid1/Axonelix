"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-4 max-w-md p-6 bg-white dark:bg-zinc-900 rounded-lg border border-red-200 dark:border-red-900">
        <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
