'use client';

import { cn } from '@/lib/utils';
import { Flag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { QuizQuestion } from '@/lib/types/quizzes';
import type { LocalAnswer } from '@/hooks/use-test-session';

type QuestionNavStatus = 'answered' | 'marked' | 'seen' | 'unseen';

const STATUS_LABEL: Record<QuestionNavStatus, string> = {
  answered: 'Answered',
  marked: 'Marked',
  seen: 'Visited',
  unseen: 'Not answered',
};

function getQuestionStatus(
  question: QuizQuestion,
  answer: LocalAnswer | undefined,
  seen: Set<number>,
): QuestionNavStatus {
  const hasAnswer =
    answer?.selectedOptionId !== undefined || !!answer?.writtenAnswer;
  if (answer?.isMarked) return 'marked';
  if (hasAnswer) return 'answered';
  if (seen.has(question.id)) return 'seen';
  return 'unseen';
}

interface QuestionNavigatorPanelProps {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<number, LocalAnswer>;
  seen: Set<number>;
  onNavigate: (index: number) => void;
}

export function QuestionNavigatorPanel({
  questions,
  currentIndex,
  answers,
  seen,
  onNavigate,
}: QuestionNavigatorPanelProps) {
  const answered = questions.filter((q) => {
    const a = answers[q.id];
    return a?.selectedOptionId !== undefined || !!a?.writtenAnswer;
  }).length;

  const marked = questions.filter((q) => answers[q.id]?.isMarked).length;

  return (
    <aside className="flex flex-col bg-card border-border border-l w-64 h-full">
      <div className="px-4 py-3 border-border border-b shrink-0">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Question Map
        </p>
      </div>

      {/* Legend */}
      <div className="gap-x-3 gap-y-1.5 grid grid-cols-2 px-4 py-2 border-border border-b shrink-0">
        {[
          { status: 'answered' as const, label: 'Answered' },
          { status: 'marked' as const, label: 'Marked' },
          { status: 'seen' as const, label: 'Visited' },
          { status: 'unseen' as const, label: 'Unseen' },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <QuestionDot status={status} size="sm" />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center px-4 py-2 border-border border-b shrink-0">
        <span className="text-muted-foreground text-xs">
          <span className="font-semibold text-foreground">{answered}</span> / {questions.length} answered
        </span>
        {marked > 0 && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
            <Flag className="size-3" />
            {marked}
          </span>
        )}
      </div>

      {/* Grid of question numbers */}
      <ScrollArea className="flex-1">
        <div className="gap-1.5 grid grid-cols-5 p-3">
          {questions.map((q, i) => {
            const status = getQuestionStatus(q, answers[q.id], seen);
            const isCurrent = i === currentIndex;

            return (
              <Tooltip key={q.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onNavigate(i)}
                    className={cn(
                      'relative flex justify-center items-center rounded-md aspect-square font-semibold text-[11px] transition-all',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      isCurrent && 'ring-2 ring-primary ring-offset-1',
                    )}
                  >
                    <QuestionDot status={status} size="md" label={String(i + 1)} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Q{i + 1} · {STATUS_LABEL[status]}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}

// ─── Dot helper ───────────────────────────────────────────────────────────────

function QuestionDot({
  status,
  size,
  label,
}: {
  status: QuestionNavStatus;
  size: 'sm' | 'md';
  label?: string;
}) {
  const colorMap: Record<QuestionNavStatus, string> = {
    answered: 'bg-emerald-500 text-white',
    marked: 'bg-amber-500 text-white',
    seen: 'bg-muted-foreground/30 text-muted-foreground',
    unseen: 'bg-muted/60 text-muted-foreground/40 border border-border',
  };

  const sizeClass = size === 'sm' ? 'w-3 h-3 rounded-full' : 'w-full h-full rounded-md text-[11px]';

  return (
    <span className={cn('flex justify-center items-center', sizeClass, colorMap[status])}>
      {size === 'md' && label}
    </span>
  );
}
