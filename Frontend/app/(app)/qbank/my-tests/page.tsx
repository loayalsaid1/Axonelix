import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { MyTestsContent } from "@/components/qbank/my-tests/MyTestsContent";
import { StatsRowSkeleton } from "@/components/qbank/my-tests/StatsRow";
import { SessionsTableSkeleton } from "@/components/qbank/my-tests/SessionsTable";

export const metadata: Metadata = { title: "My Tests" };

export default function MyTestsPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex justify-center items-center bg-muted rounded-lg size-9">
          <ClipboardList className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-xl tracking-tight">My Tests</h1>
          <p className="text-muted-foreground text-sm">
            Track and review all your quiz sessions and assessment history.
          </p>
        </div>
      </div>

      {/*
        Suspense boundary so the page streams: the header renders immediately
        while the client component mounts and fetches data on the browser side.
      */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <StatsRowSkeleton />
            <SessionsTableSkeleton />
          </div>
        }
      >
        <MyTestsContent />
      </Suspense>
    </div>
  );
}
