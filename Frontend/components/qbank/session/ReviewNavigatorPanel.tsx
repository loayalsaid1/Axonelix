'use client';

import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewEntry } from '@/lib/types/quizzes';

// ─── Per-question dot colour ──────────────────────────────────────────────────

type DotVariant = 'correct' | 'incorrect' | 'ungraded' | 'current';

function getDotVariant(entry: ReviewEntry, isCurrent: boolean): DotVariant {
  if (isCurrent) return 'current';
  if (entry.isCorrect === true) return 'correct';
  if (entry.isCorrect === false) return 'incorrect';
  return 'ungraded'; // written / null
}

const dotColorMap: Record<DotVariant, string> = {
  correct: 'bg-emerald-500 text-white ring-emerald-500/30',
  incorrect: 'bg-destructive text-white ring-destructive/30',
  ungraded: 'bg-muted text-muted-foreground ring-muted-foreground/20',
  current: 'bg-primary text-primary-foreground ring-primary/30',
};

// ─── Summary counts ───────────────────────────────────────────────────────────

function SummaryRow({
  icon,
  label,
  count,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  className?: string;
}) {
  return (
    <div className={cn('flex justify-between items-center text-xs', className)}>
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="font-bold tabular-nums">{count}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ReviewNavigatorPanelProps {
  /** Full (possibly filtered) set of entries to display. */
  entries: ReviewEntry[];
  /** Index into `entries` for the currently visible card. */
  currentIndex: number;
  onNavigate: (index: number) => void;
  className?: string;
}

export function ReviewNavigatorPanel({
  entries,
  currentIndex,
  onNavigate,
  className,
}: ReviewNavigatorPanelProps) {
  const correct = entries.filter((e) => e.isCorrect === true).length;
  const incorrect = entries.filter((e) => e.isCorrect === false).length;
  const ungraded = entries.filter((e) => e.isCorrect === null).length;

  return (
    <aside className={cn("flex flex-col bg-card border-border h-full", className)}>
      {/* Title */}
      <div className="px-4 py-3 border-border border-b shrink-0">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Review Map
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-1.5 px-4 py-3 border-border border-b shrink-0">
        <SummaryRow
          icon={<CheckCircle2 className="size-3 text-emerald-500" />}
          label="Correct"
          count={correct}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryRow
          icon={<XCircle className="size-3 text-destructive" />}
          label="Incorrect / Skipped"
          count={incorrect}
          className="text-destructive"
        />
        {ungraded > 0 && (
          <SummaryRow
            icon={<MinusCircle className="size-3 text-muted-foreground" />}
            label="Ungraded (Written)"
            count={ungraded}
            className="text-muted-foreground"
          />
        )}
      </div>

      {/* Legend */}
      <div className="gap-x-3 gap-y-1 grid grid-cols-2 px-4 py-2 border-border border-b shrink-0">
        {(
          [
            { variant: 'correct' as const, label: 'Correct' },
            { variant: 'incorrect' as const, label: 'Incorrect' },
            { variant: 'ungraded' as const, label: 'Written' },
          ] as const
        ).map(({ variant, label }) => (
          <div key={variant} className="flex items-center gap-1.5">
            <span
              className={cn(
                'rounded-full w-2.5 h-2.5 shrink-0',
                dotColorMap[variant].split(' ')[0], // just the bg class
              )}
            />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="gap-1.5 grid grid-cols-5">
          {entries.map((entry, i) => {
            const variant = getDotVariant(entry, i === currentIndex);
            const isCurrent = i === currentIndex;
            return (
              <button
                key={entry.question.id}
                type="button"
                onClick={() => onNavigate(i)}
                title={`Q${entry.questionNumber}`}
                className={cn(
                  'relative flex justify-center items-center rounded-md aspect-square',
                  'font-semibold text-[11px] transition-all',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  dotColorMap[variant],
                  isCurrent && 'ring-2 ring-offset-1',
                )}
              >
                {entry.questionNumber}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
