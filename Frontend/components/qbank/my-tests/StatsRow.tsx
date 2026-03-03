import { Skeleton } from "@/components/ui/skeleton";
import type { UserTestStats } from "@/lib/types/quizzes";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-card p-6 border rounded-xl">
      <p className="font-medium text-muted-foreground text-sm">{label}</p>
      <p className="mt-2 font-bold text-3xl tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-muted-foreground text-xs">{sub}</p>}
    </div>
  );
}

export function StatsRowSkeleton() {
  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2 bg-card p-6 border rounded-xl">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-20 h-9" />
        </div>
      ))}
    </div>
  );
}

interface StatsRowProps {
  stats: UserTestStats;
}

export function StatsRow({ stats }: StatsRowProps) {
  const unfinished =
    stats.suspendedCount + stats.inProgressCount + stats.notStartedCount;

  const avgLabel =
    stats.averageScore != null
      ? `${stats.averageScore.toFixed(1)}%`
      : "—";

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
      <StatCard
        label="Total Tests Taken"
        value={stats.totalSessions}
        sub={`${stats.completedCount} completed`}
      />
      <StatCard
        label="Average Score"
        value={avgLabel}
        sub="Across completed tests"
      />
      <StatCard
        label="Unfinished Tests"
        value={unfinished}
        sub={`${stats.suspendedCount} suspended · ${stats.inProgressCount} in progress`}
      />
    </div>
  );
}
