import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/lib/types/quizzes";

interface StatusConfig {
  label: string;
  dotClass: string;
  wrapperClass: string;
}

const STATUS_CONFIG: Record<SessionStatus, StatusConfig> = {
  completed: {
    label: "Completed",
    dotClass: "bg-emerald-500",
    wrapperClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  in_progress: {
    label: "In Progress",
    dotClass: "bg-blue-500",
    wrapperClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  suspended: {
    label: "Suspended",
    dotClass: "bg-amber-500",
    wrapperClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  not_started: {
    label: "Not Started",
    dotClass: "bg-muted-foreground",
    wrapperClass: "bg-muted text-muted-foreground",
  },
};

interface StatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, dotClass, wrapperClass } = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-xs",
        wrapperClass,
        className,
      )}
    >
      <span className={cn("rounded-full size-1.5", dotClass)} />
      {label}
    </span>
  );
}
