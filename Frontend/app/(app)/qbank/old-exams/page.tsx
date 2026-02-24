import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OldExamsContent } from "@/components/qbank/OldExamsContent";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = { title: "Old Exams" };

export default function OldExamsPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex justify-center items-center bg-muted rounded-lg size-9">
          <GraduationCap className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-xl tracking-tight">Old Exams</h1>
          <p className="text-muted-foreground text-sm">
            Browse past exams by module, subject type, and exam type.
          </p>
        </div>
      </div>

      {/*
        Suspense wraps OldExamsContent so that Next.js streaming works and
        useSearchParams() inside doesn't force a full client-side boundary.
      */}
      <Suspense
        fallback={
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="rounded-xl h-28" />
            ))}
          </div>
        }
      >
        <OldExamsContent />
      </Suspense>
    </div>
  );
}
