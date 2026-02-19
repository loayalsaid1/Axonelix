import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface EntityCardProps {
  href: string;
  name: string;
  description?: string | null;
  /** Optional meta text in the top-right (e.g. "12 lessons") */
  meta?: string;
  /** Optional badge label */
  badge?: string;
  badgeVariant?: "theoretical" | "practical" | "default";
  /** Mocked progress 0-100 */
  progress?: number;
  /** Mocked count string in footer */
  footerLabel?: string;
  className?: string;
}

/**
 * Generic card for any hierarchy level entity (module, subject, chapter, lesson).
 * Renders as a navigable link card.
 */
export function EntityCard({
  href,
  name,
  description,
  meta,
  badge,
  badgeVariant = "default",
  progress,
  footerLabel,
  className,
}: EntityCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col bg-card p-4 border border-border rounded-xl transition-all",
        "hover:border-primary/40 hover:shadow-md",
        className
      )}
    >
      {/* Top row */}
      <div className="flex justify-between items-start gap-2 mb-3">
        {badge && (
          <Badge
            variant="outline"
            className={cn(
              "uppercase tracking-wider shrink-0",
              badgeVariant === "theoretical"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                : badgeVariant === "practical"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  : ""
            )}
          >
            {badge}
          </Badge>
        )}
        {meta && (
          <span className="ml-auto text-muted-foreground text-xs shrink-0">
            {meta}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="mb-1 font-semibold group-hover:text-primary text-sm line-clamp-2 leading-snug transition-colors">
        {name}
      </h3>

      {/* Description */}
      {description && (
        <p className="mb-3 text-muted-foreground text-xs line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Progress */}
      {progress !== undefined && (
        <div className="space-y-1 mt-3">
          <div className="flex justify-between items-center text-[11px] text-muted-foreground">
            <span>Progress</span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-auto pt-2">
        {footerLabel ? (
          <span className="text-muted-foreground text-xs">{footerLabel}</span>
        ) : (
          <span />
        )}
        <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
