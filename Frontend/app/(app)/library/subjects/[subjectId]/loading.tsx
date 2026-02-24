import { Skeleton } from "@/components/ui/skeleton";

export default function SubjectLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="rounded w-72 h-5" />
      <div className="space-y-2">
        <Skeleton className="rounded w-64 h-8" />
        <Skeleton className="rounded w-96 h-4" />
      </div>
      <div className="space-y-8">
        {[0, 1, 2].map((g) => (
          <div key={g} className="space-y-3">
            <Skeleton className="rounded w-40 h-6" />
            <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="rounded-xl h-32" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
