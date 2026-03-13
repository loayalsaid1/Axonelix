'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GeneratorState, GeneratorAction } from '@/hooks/use-quiz-generator';
import type { QuestionType, QuestionStatus } from '@/lib/types/quizzes';

import { QuestionTypeSection } from './config/QuestionTypeSection';
import { QuestionPoolSection } from './config/QuestionPoolSection';
import { QuestionCountSection } from './config/QuestionCountSection';
import { TestModeSection } from './config/TestModeSection';
import { TestTitleSection } from './config/TestTitleSection';

// ─── Config panel ─────────────────────────────────────────────────────────────

interface GeneratorConfigPanelProps {
  state: GeneratorState;
  dispatch: React.Dispatch<GeneratorAction>;
  onGenerate: () => void;
  totalSelected: number;
}

export function GeneratorConfigPanel({ state, dispatch, onGenerate, totalSelected }: GeneratorConfigPanelProps) {
  const enoughAvailable = state.availableCount !== null && state.availableCount > 0 && state.questionCount <= state.availableCount;
  const notGenerating = !state.isGenerating;

  const canGenerate = enoughAvailable && notGenerating;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable config area */}
      <ScrollArea className="flex-1 overflow-y-auto" >
        <div className="space-y-8 mx-auto px-6 py-8 max-w-2xl">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="font-bold text-2xl">Configure Test</h1>
            <p className="text-muted-foreground text-sm">
              Pick question filters, set the count, then generate your test.
            </p>
          </div>

          <QuestionTypeSection
            value={state.questionType}
            onChange={(v) => dispatch({ type: 'SET_QUESTION_TYPE', value: v })}
          />

          <Separator />

          <QuestionPoolSection
            value={state.questionStatus}
            onChange={(v) => dispatch({ type: 'SET_QUESTION_STATUS', value: v })}
          />

          <Separator />

          <QuestionCountSection
            count={state.questionCount}
            availableCount={state.availableCount}
            isCountLoading={state.isCountLoading}
            onChange={(v) => dispatch({ type: 'SET_QUESTION_COUNT', value: v })}
          />

          <Separator />

          <TestModeSection />

          <Separator />

          <TestTitleSection
            value={state.title}
            onChange={(v) => dispatch({ type: 'SET_TITLE', value: v })}
          />
        </div>
      </ScrollArea>

      {/* ── Generate button ── */}
      <div className="bg-card/50 backdrop-blur px-6 py-4 border-border border-t shrink-0">
        <div className="flex justify-between items-center gap-4 mx-auto max-w-2xl">
          <div className="text-muted-foreground text-sm">
            {state.availableCount !== null && state.availableCount < state.questionCount && (
              <span className="text-amber-600 dark:text-amber-400 text-xs">
                Only {state.availableCount} question{state.availableCount !== 1 ? 's' : ''} available — reduce the count.
              </span>
            )}
          </div>
          <Button
            size="lg"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="gap-2 min-w-40"
          >
            {state.isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Test
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
