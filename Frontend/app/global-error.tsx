"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html>
      <body className="bg-zinc-50 dark:bg-black">
        <div className="flex items-center justify-center w-full min-h-screen">
          <div className="flex flex-col items-center gap-6 max-w-md p-8 bg-white dark:bg-zinc-900 rounded-lg border border-red-200 dark:border-red-900 shadow-lg">
            <AlertCircle className="size-12 text-red-600 dark:text-red-400" />
            
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Application Error
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {error.message || "A critical error occurred. Please refresh the page."}
              </p>
              {error.digest && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 font-mono mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => reset()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <RotateCcw className="size-4" />
                Try again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
