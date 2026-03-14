'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SessionTopBar } from './SessionTopBar';
import { QuestionDisplay } from './QuestionDisplay';
import { QuestionNavigatorPanel } from './QuestionNavigatorPanel';
import { useTestSession } from '@/hooks/use-test-session';
import type { SessionDetail } from '@/lib/types/quizzes';

interface TestInterfaceProps {
  sessionDetail: SessionDetail;
  onSessionEnded?: () => void;
}

/**
 * Full-screen test-taking interface for in_progress sessions.
 * Also works as the entry point for re-hydrated resume sessions.
 */
export function TestInterface({ sessionDetail, onSessionEnded }: TestInterfaceProps) {
  const {
    state,
    questions,
    currentQuestion,
    totalAnswered,
    goTo,
    goNext,
    goPrev,
    selectOption,
    setWritten,
    toggleMark,
    toggleEliminate,
    submitAnswer,
    toggleShowAllAnswers,
    suspendSession,
    endSession,
  } = useTestSession({ sessionDetail, onSessionEnded });

  if (!currentQuestion) return null;

  const isFirst = state.currentIndex === 0;
  const isLast = state.currentIndex === questions.length - 1;
  const currentAnswer = state.answers[currentQuestion.id];
  const canSubmit = currentAnswer?.selectedOptionId !== undefined || !!currentAnswer?.writtenAnswer;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <SessionTopBar
          quiz={sessionDetail.quiz}
          session={sessionDetail.session}
          currentIndex={state.currentIndex}
          totalAnswered={totalAnswered}
          elapsedSecs={state.elapsedSecs}
          showAllAnswers={state.showAllAnswers}
          onToggleShowAllAnswers={toggleShowAllAnswers}
          onSuspend={suspendSession}
          onEnd={endSession}
        />

        {/* Main body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Question content area */}
          <main className="flex-1 overflow-y-auto">
            <div className="space-y-6 mx-auto px-4 md:px-8 py-8 max-w-3xl">
              <QuestionDisplay
                question={currentQuestion}
                questionNumber={state.currentIndex + 1}
                answer={currentAnswer}
                showAllAnswers={state.showAllAnswers}
                onSelectOption={selectOption}
                onSetWritten={setWritten}
                onToggleMark={toggleMark}
                onToggleEliminate={toggleEliminate}
              />

              {/* Navigation */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={isFirst}
                  className="gap-1.5"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs font-medium">
                    {state.currentIndex + 1} / {questions.length}
                  </span>

                  {!state.showAllAnswers && !currentAnswer?.isSubmitted && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs px-3"
                      disabled={!canSubmit}
                      onClick={() => submitAnswer(currentQuestion.id)}
                    >
                      Check
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={isLast}
                  className="gap-1.5"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </main>

          {/* Right side: question navigator (hidden on small screens) */}
          <div className="hidden lg:block shrink-0">
            <QuestionNavigatorPanel
              questions={questions}
              currentIndex={state.currentIndex}
              answers={state.answers}
              seen={state.seen}
              onNavigate={goTo}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
