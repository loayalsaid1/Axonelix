'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionOption } from '@/lib/types/quizzes';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OptionOutcome =
  | 'selected-correct'  // user picked this, and it's right
  | 'selected-wrong'    // user picked this, but it's wrong
  | 'correct-missed'    // correct answer the user did NOT pick
  | 'neutral';          // wrong option not selected — fade it out

export function getOptionOutcome(
  optionId: number,
  isCorrectOption: boolean,
  selectedOptionId: number | null | undefined,
): OptionOutcome {
  const wasSelected = selectedOptionId === optionId;
  if (wasSelected && isCorrectOption)  return 'selected-correct';
  if (wasSelected && !isCorrectOption) return 'selected-wrong';
  if (!wasSelected && isCorrectOption) return 'correct-missed';
  return 'neutral';
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const containerStyles: Record<OptionOutcome, string> = {
  'selected-correct': 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'selected-wrong':   'border-destructive bg-destructive/10 text-destructive',
  'correct-missed':   'border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-dashed',
  neutral:            'border-border bg-muted/20 text-muted-foreground opacity-60',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

// ─── Internal icon ────────────────────────────────────────────────────────────

function OutcomeIcon({
  outcome,
  label,
}: {
  outcome: OptionOutcome;
  label: string;
}) {
  if (outcome === 'selected-correct')
    return <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />;
  if (outcome === 'selected-wrong')
    return <XCircle className="size-5 text-destructive shrink-0" />;
  if (outcome === 'correct-missed')
    return <CheckCircle2 className="size-5 text-emerald-500/60 shrink-0" />;

  // neutral — plain letter badge
  return (
    <span className="flex justify-center items-center border-2 border-muted-foreground/30 rounded-full w-5 h-5 font-bold text-[10px] text-muted-foreground/40 shrink-0">
      {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MCQReviewOptionsProps {
  options: QuestionOption[];
  /** The option the user selected (null / undefined = skipped). */
  selectedOptionId: number | null | undefined;
}

/**
 * Read-only MCQ option list for the post-test review screen.
 * Mirrors the structure of MCQAnswerOptions but is non-interactive and
 * color-codes each option by its outcome.
 */
export function MCQReviewOptions({ options, selectedOptionId }: MCQReviewOptionsProps) {
  return (
    <div className="space-y-2.5">
      {options.map((opt, i) => {
        const label   = OPTION_LABELS[i] ?? String.fromCharCode(65 + i);
        const outcome = getOptionOutcome(opt.id, opt.isCorrect, selectedOptionId);

        return (
          <div
            key={opt.id}
            className={cn(
              'flex items-center gap-3.5 px-4 py-3 border rounded-lg',
              containerStyles[outcome],
            )}
          >
            <OutcomeIcon outcome={outcome} label={label} />
            <span className="flex-1 text-sm leading-snug">{opt.optionText}</span>
          </div>
        );
      })}
    </div>
  );
}
