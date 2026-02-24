import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="rounded w-96 h-5" />
      <div className="space-y-2">
        <Skeleton className="rounded w-64 h-8" />
        <Skeleton className="rounded w-80 h-4" />
      </div>
      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="rounded-md w-28 h-9" />
          <Skeleton className="rounded-md w-28 h-9" />
          <Skeleton className="rounded-md w-28 h-9" />
        </div>
        <Skeleton className="rounded-xl w-full h-[400px]" />
      </div>
    </div>
  );
}
