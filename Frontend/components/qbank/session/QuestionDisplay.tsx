'use client';

import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MCQAnswerOptions } from './MCQAnswerOptions';
import { WrittenAnswerInput } from './WrittenAnswerInput';
import EditorPreview from '@/components/editor-preview/EditorPreview';
import { QuestionStatementPreview } from '@/components/shared/question-statement-preview';
import type { QuizQuestion } from '@/lib/types/quizzes';
import type { LocalAnswer } from '@/hooks/use-test-session';

interface QuestionDisplayProps {
  question: QuizQuestion;
  questionNumber: number;
  answer: LocalAnswer | undefined;
  showAllAnswers?: boolean;
  onSelectOption: (questionId: number, optionId: number) => void;
  onSetWritten: (questionId: number, text: string) => void;
  onToggleMark: (questionId: number) => void;
  onToggleEliminate: (questionId: number, optionId: number) => void;
}

export function QuestionDisplay({
  question,
  questionNumber,
  answer,
  showAllAnswers,
  onSelectOption,
  onSetWritten,
  onToggleMark,
  onToggleEliminate,
}: QuestionDisplayProps) {
  const isMarked = !!answer?.isMarked;
  const showResult = showAllAnswers || answer?.isSubmitted;

  return (
    <Card className="gap-0 p-0 overflow-hidden">
      {/* Utility bar */}
      <div className="flex justify-between items-center bg-muted/20 px-5 py-3 border-border border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Q{questionNumber}
          </Badge>
          <Badge
            variant={question.questionType === 'mcq' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {question.questionType === 'mcq' ? 'MCQ' : 'Written'}
          </Badge>
          {question.isMisc && (
            <Badge variant="outline" className="border-dashed text-xs">
              Misc
            </Badge>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onToggleMark(question.id)}
          className={cn(
            'gap-1.5 text-xs transition-colors',
            isMarked
              ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
              : 'text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400',
          )}
        >
          <Flag className={cn('size-3.5', isMarked && 'fill-current')} />
          {isMarked ? 'Marked' : 'Mark for later'}
        </Button>
      </div>

      {/* Question statement */}
      <CardContent className="pt-6 pb-4">
        <QuestionStatementPreview
          statement={question.statement}
          statementFormat={question.statementFormat}
          richContainerClassName="rounded-lg border bg-muted/10 p-3"
          plainClassName="text-foreground text-base leading-relaxed whitespace-pre-wrap"
        />
      </CardContent>

      {/* Answer area */}
      <CardContent
        className={cn(
          'pb-6',
          question.questionType === 'mcq' ? 'pt-2' : 'pt-4',
        )}
      >
        {question.questionType === 'mcq' ? (
          <MCQAnswerOptions
            options={question.questionOptions}
            selectedOptionId={answer?.selectedOptionId}
            eliminatedOptions={answer?.eliminatedOptions ?? new Set()}
            showResult={showResult}
            onSelect={(optionId) => onSelectOption(question.id, optionId)}
            onToggleEliminate={(optionId) => onToggleEliminate(question.id, optionId)}
          />
        ) : (
          <WrittenAnswerInput
            questionId={question.id}
            value={answer?.writtenAnswer}
            onChange={(text) => onSetWritten(question.id, text)}
            disabled={showResult}
          />
        )}
      </CardContent>

      {/* Explanation Area */}
      {showResult && question.explanation && (
        <div className="bg-muted/30 px-5 py-4 border-border border-t">
          <h4 className="mb-2 font-semibold text-sm">Explanation</h4>
          <div className="text-muted-foreground text-sm prose dark:prose-invert max-w-none">
            <EditorPreview content={question.explanation} />
          </div>
        </div>
      )}
    </Card>
  );
}
