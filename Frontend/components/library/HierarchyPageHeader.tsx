import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface HierarchyPageHeaderProps {
  name: string;
  description?: string | null;
  /** Optional badge text shown beside the name (e.g. "Theoretical") */
  badge?: string;
  badgeVariant?: "theoretical" | "practical";
  /** Mock progress value 0-100; shown as a small stat if provided */
  progress?: number;
  /** Mock count of available questions */
  questionCount?: number;
  className?: string;
}

/**
 * Consistent header shown at the top of every hierarchy-level page.
 * Stats (progress, questions) are mocked for now as per spec.
 */
export function HierarchyPageHeader({
  name,
  description,
  badge,
  badgeVariant,
  progress,
  questionCount,
  className,
}: HierarchyPageHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap justify-between items-start gap-3">
        {/* Title + badge */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-2xl tracking-tight">{name}</h1>
            {badge && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded font-medium text-xs uppercase tracking-wide",
                  badgeVariant === "theoretical"
                    ? "bg-blue-500/10 text-blue-500"
                    : badgeVariant === "practical"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="max-w-2xl text-muted-foreground text-sm">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/qbank/generate-tests">
              <Zap className="mr-1.5 size-3.5" />
              Generate Test
            </Link>
          </Button>
        </div>
      </div>

      {/* Mocked stats row */}
      {(progress !== undefined || questionCount !== undefined) && (
        <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
          {questionCount !== undefined && (
            <span>
              <span className="font-medium text-foreground">{questionCount}</span>{" "}
              questions available
            </span>
          )}
          {progress !== undefined && (
            <span>
              <span className="font-medium text-foreground">{progress}%</span>{" "}
              completed
            </span>
          )}
        </div>
      )}
    </div>
  );
}
