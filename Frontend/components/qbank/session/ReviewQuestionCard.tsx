'use client';

import { CheckCircle2, XCircle, MinusCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MCQReviewOptions } from './MCQReviewOptions';
import type { ReviewEntry } from '@/lib/types/quizzes';
import { QuestionStatementPreview } from '@/components/shared/question-statement-preview';
import { ContentRenderer } from '@/components/shared/content-renderer';

// ─── Result badge ─────────────────────────────────────────────────────────────

function ResultBadge({ isCorrect }: { isCorrect: boolean | null }) {
  if (isCorrect === true)
    return (
      <Badge className="gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs">
        <CheckCircle2 className="size-3" /> Correct
      </Badge>
    );
  if (isCorrect === false)
    return (
      <Badge variant="destructive" className="gap-1 opacity-80 text-xs">
        <XCircle className="size-3" /> Incorrect
      </Badge>
    );
  return (
    <Badge variant="outline" className="gap-1 text-xs">
      <MinusCircle className="size-3" /> Ungraded
    </Badge>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ReviewQuestionCardProps {
  entry: ReviewEntry;
}

/**
 * Read-only question card for the review view.
 *
 * Structure mirrors QuestionDisplay so the UI feels consistent, but this
 * component is strictly non-interactive — no callbacks, no local state.
 * MCQ option outcome coloring is delegated to MCQReviewOptions (sibling of
 * MCQAnswerOptions), keeping the pattern consistent with the test interface.
 */
export function ReviewQuestionCard({ entry }: ReviewQuestionCardProps) {
  const { question, answer, isCorrect, questionNumber } = entry;
  const isMcq     = question.questionType === 'mcq';
  const isSkipped = !answer;

  return (
    <Card className="gap-0 p-0 overflow-hidden">
      {/* Header bar — mirrors QuestionDisplay's utility bar */}
      <div className="flex justify-between items-center bg-muted/20 px-5 py-3 border-border border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Q{questionNumber}
          </Badge>
          <Badge variant={isMcq ? 'default' : 'secondary'} className="text-xs">
            {isMcq ? 'MCQ' : 'Written'}
          </Badge>
          {question.isMisc && (
            <Badge variant="outline" className="border-dashed text-xs">Misc</Badge>
          )}
          {isSkipped && (
            <Badge variant="outline" className="border-dashed text-muted-foreground text-xs">
              Skipped
            </Badge>
          )}
        </div>
        <ResultBadge isCorrect={isCorrect} />
      </div>

      {/* Statement — identical rendering to QuestionDisplay */}
      <CardContent className="pt-6 pb-4">
        <QuestionStatementPreview
          statement={question.statement}
          statementFormat={question.statementFormat}
          richContainerClassName="rounded-lg border bg-muted/10 p-3"
          plainClassName="text-foreground text-base leading-relaxed whitespace-pre-wrap"
        />
      </CardContent>

      {/* Answer area */}
      <CardContent className={cn('pb-6', isMcq ? 'pt-2' : 'pt-4')}>
        {isMcq ? (
          <MCQReviewOptions
            options={question.questionOptions}
            selectedOptionId={answer?.selectedOptionId}
          />
        ) : (
          <div className="space-y-1.5">
            <p className="font-medium text-muted-foreground text-xs">Your Answer</p>
            {answer?.writtenAnswer ? (
              <div className="bg-muted/30 px-4 py-3 border border-border rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                {answer.writtenAnswer}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic">No answer provided.</p>
            )}
          </div>
        )}
      </CardContent>

      {/* Explanation */}
      {question.explanation && (
        <CardContent className="space-y-2 pt-5 pb-5 border-t">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Lightbulb className="size-4 shrink-0" />
            <span className="font-semibold text-sm">Explanation</span>
          </div>
          <ContentRenderer
            content={question.explanation}
            isLegacyFormat={question.explanationIsLegacyFormat}
            className="text-muted-foreground text-sm leading-relaxed prose dark:prose-invert max-w-none"
            loadingClassName="h-20 w-full rounded-md bg-muted animate-pulse"
          />
        </CardContent>
      )}
    </Card>
  );
}
