'use client';

import { cn } from '@/lib/utils';
import { Strikethrough } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { QuestionOption } from '@/lib/types/quizzes';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface MCQAnswerOptionsProps {
  options: QuestionOption[];
  selectedOptionId?: number;
  eliminatedOptions: Set<number>;
  onSelect: (optionId: number) => void;
  onToggleEliminate: (optionId: number) => void;
}

export function MCQAnswerOptions({
  options,
  selectedOptionId,
  eliminatedOptions,
  onSelect,
  onToggleEliminate,
}: MCQAnswerOptionsProps) {
  return (
    <div className="space-y-2.5">
      {options.map((opt, i) => {
        const label = OPTION_LABELS[i] ?? String.fromCharCode(65 + i);
        const isSelected = selectedOptionId === opt.id;
        const isEliminated = eliminatedOptions.has(opt.id);

        return (
          <div
            key={opt.id}
            className={cn(
              'group flex items-center gap-3',
              isEliminated && 'opacity-45',
            )}
          >
            {/* Option label + text */}
            <label
              className={cn(
                'flex flex-1 items-center gap-3.5 px-4 py-3 border rounded-lg transition-all cursor-pointer select-none',
                isEliminated
                  ? 'border-transparent bg-muted/20 pointer-events-none'
                  : isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-accent/30',
              )}
              onClick={() => !isEliminated && onSelect(opt.id)}
            >
              {/* Radio indicator */}
              <span
                className={cn(
                  'flex justify-center items-center border-2 rounded-full w-5 h-5 font-bold text-[10px] transition-all shrink-0',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/40 text-muted-foreground',
                )}
              >
                {isSelected ? '✓' : label}
              </span>

              {/* Text */}
              <span
                className={cn(
                  'flex-1 text-sm leading-snug transition-colors',
                  isEliminated && 'line-through text-muted-foreground',
                  isSelected && !isEliminated && 'text-primary font-medium',
                )}
              >
                {opt.optionText}
              </span>
            </label>

            {/* Strike-through button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleEliminate(opt.id);
                  }}
                  className={cn(
                    'border rounded-lg shrink-0 transition-all',
                    isEliminated
                      ? 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive'
                      : 'border-border hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive text-muted-foreground',
                  )}
                >
                  <Strikethrough className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isEliminated ? 'Undo strikethrough' : 'Strike out option'}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
