'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Strikethrough } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { QuestionOption } from '@/lib/types/quizzes';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

const optionWrapperVariants = cva(
  'flex flex-1 items-center gap-3.5 px-4 py-3 border rounded-lg transition-all select-none',
  {
    variants: {
      state: {
        default: 'border-border bg-card hover:border-primary/50 hover:bg-accent/30 cursor-pointer',
        selected: 'border-primary bg-primary/10 shadow-sm cursor-pointer',
        eliminated: 'border-transparent bg-muted/20 pointer-events-none cursor-pointer',
        correct: 'border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/15 cursor-default',
        'incorrect-selected': 'border-destructive/50 bg-destructive/10 dark:bg-destructive/15 cursor-default',
        'unselected-result': 'border-border bg-card/50 opacity-60 cursor-default',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

const radioIndicatorVariants = cva(
  'flex justify-center items-center border-2 rounded-full w-5 h-5 font-bold text-[10px] transition-all shrink-0',
  {
    variants: {
      state: {
        default: 'border-muted-foreground/40 text-muted-foreground',
        selected: 'border-primary bg-primary text-primary-foreground',
        eliminated: 'border-muted-foreground/40 text-muted-foreground',
        correct: 'border-emerald-500 bg-emerald-500 text-white',
        'incorrect-selected': 'border-destructive bg-destructive text-white',
        'unselected-result': 'border-muted-foreground/30 text-muted-foreground/60',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

const textVariants = cva('flex-1 text-sm leading-snug transition-colors', {
  variants: {
    state: {
      default: '',
      selected: 'text-primary font-medium',
      eliminated: 'line-through text-muted-foreground',
      correct: 'text-emerald-700 dark:text-emerald-400 font-medium',
      'incorrect-selected': 'text-destructive font-medium',
      'unselected-result': '',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

const strikethroughBtnVariants = cva(
  'border rounded-lg transition-all shrink-0',
  {
    variants: {
      isEliminated: {
        true: 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive',
        false: 'border-border hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive text-muted-foreground',
      },
    },
    defaultVariants: {
      isEliminated: false,
    },
  }
);

type OptionState = VariantProps<typeof optionWrapperVariants>['state'];

interface MCQAnswerOptionsProps {
  options: QuestionOption[];
  selectedOptionId?: number;
  eliminatedOptions: Set<number>;
  showResult?: boolean;
  onSelect: (optionId: number) => void;
  onToggleEliminate: (optionId: number) => void;
}

export function MCQAnswerOptions({
  options,
  selectedOptionId,
  eliminatedOptions,
  showResult,
  onSelect,
  onToggleEliminate,
}: MCQAnswerOptionsProps) {
  return (
    <div className="space-y-2.5">
      {options.map((opt, i) => {
        const label = OPTION_LABELS[i] ?? String.fromCharCode(65 + i);
        const isSelected = selectedOptionId === opt.id;
        const isEliminated = eliminatedOptions.has(opt.id);

        let optionState: OptionState = 'default';
        if (showResult) {
          if (opt.isCorrect) optionState = 'correct';
          else if (isSelected) optionState = 'incorrect-selected';
          else optionState = 'unselected-result';
        } else {
          if (isEliminated) optionState = 'eliminated';
          else if (isSelected) optionState = 'selected';
          else optionState = 'default';
        }

        let iconContent = label;
        if (showResult) {
          if (opt.isCorrect) iconContent = '✓';
          else if (isSelected) iconContent = '✕';
        } else if (isSelected) {
          iconContent = '✓';
        }

        return (
          <div
            key={opt.id}
            className={cn(
              'group flex items-center gap-3',
              isEliminated && !showResult && 'opacity-45'
            )}
          >
            {/* Option label + text */}
            <label
              className={optionWrapperVariants({ state: optionState })}
              onClick={() => !showResult && !isEliminated && onSelect(opt.id)}
            >
              {/* Radio indicator */}
              <span className={radioIndicatorVariants({ state: optionState })}>
                {iconContent}
              </span>

              {/* Text */}
              <span className={textVariants({ state: optionState })}>
                {opt.optionText}
              </span>
            </label>

            {/* Strike-through button */}
            {!showResult && (
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
                    className={strikethroughBtnVariants({ isEliminated })}
                  >
                    <Strikethrough className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isEliminated ? 'Undo strikethrough' : 'Strike out option'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      })}
    </div>
  );
}
