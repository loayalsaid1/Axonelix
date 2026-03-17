import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Lesson } from "@/lib/types/materials";

interface LessonCardProps {
  lesson: Lesson;
  subjectType?: "theoretical" | "practical";
  /** Mocked progress 0-100 */
  progress?: number;
  /** Mocked question count */
  questionCount?: number;
  className?: string;
}

/**
 * Compact card for a single lesson.
 * Shows name, description, mock stats, and a progress bar.
 */
export function LessonCard({
  lesson,
  subjectType,
  progress = 0,
  questionCount = 0,
  className,
}: LessonCardProps) {
  return (
    <Link
      href={`/library/lessons/${lesson.id}`}
      className={cn(
        "group flex flex-col bg-card p-4 border border-border rounded-xl transition-all",
        "hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      {/* Top meta row */}
      {subjectType && (
        <div className="mb-3">
          <Badge
            variant="outline"
            className={cn(
              "uppercase tracking-wider",
              subjectType === "theoretical"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            )}
          >
            {subjectType}
          </Badge>
        </div>
      )}

      {/* Name */}
      <h3 className="mb-1.5 font-semibold group-hover:text-primary text-sm line-clamp-2 leading-snug transition-colors">
        {lesson.name}
      </h3>

      {/* Description */}
      {lesson.description && (
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {lesson.description}
        </p>
      )}

      {/* Progress and stats (temporarily commented out) */}
      {false && (
        <>
          <div className="mt-auto space-y-1">
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          <div className="flex items-center justify-between pt-2 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {questionCount > 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="size-3" />
                  {questionCount}Q
                </span>
              )}
            </div>
            <ArrowRight className="size-3.5 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </div>
        </>
      )}
    </Link>
  );
}
