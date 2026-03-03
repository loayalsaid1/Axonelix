import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/lib/types/quizzes";

interface ScoreCellProps {
  scorePct: number | null;
  status: SessionStatus;
}

/**
 * Renders a progress bar + percentage for completed / in-progress sessions.
 * Shows a dash for not_started sessions.
 */
export function ScoreCell({ scorePct, status }: ScoreCellProps) {
  if (status === "not_started" || scorePct == null) {
    return <span className="text-muted-foreground">—</span>;
  }

  const pct = parseFloat(String(scorePct));
  const isPartial = status === "suspended" || status === "in_progress";

  return (
    <div className="flex items-center gap-3 min-w-30">
      <div className="flex-1 bg-muted rounded-full w-24 h-1.5 overflow-hidden">
        <div
          className={cn(
            "rounded-full h-full transition-all",
            isPartial ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span
        className={cn(
          "w-10 font-bold tabular-nums text-sm text-right",
          isPartial && "text-muted-foreground",
        )}
      >
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}
