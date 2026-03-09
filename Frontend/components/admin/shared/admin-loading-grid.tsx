import { Skeleton } from '@/components/ui/skeleton';

interface AdminLoadingGridProps {
  count?: number;
  className?: string;
}

export function AdminLoadingGrid({
  count = 6,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
}: AdminLoadingGridProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  );
}
