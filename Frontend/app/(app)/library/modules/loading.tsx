import { Skeleton } from "@/components/ui/skeleton";

export default function ModulesLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="rounded w-40 h-5" />
      <div className="space-y-2">
        <Skeleton className="rounded w-48 h-8" />
        <Skeleton className="rounded w-64 h-4" />
      </div>
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="rounded-xl h-36" />
        ))}
      </div>
    </div>
  );
}
