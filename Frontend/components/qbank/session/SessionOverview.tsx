'use client';

import { Play, RotateCcw, BookOpen, Layers, HelpCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { Quiz, QuizSession, SessionStatus } from '@/lib/types/quizzes';

interface SessionOverviewProps {
  quiz: Quiz;
  session: QuizSession;
  onStart: () => void;
}

/** Shown when session status is 'not_started' or 'suspended'. */
export function SessionOverview({ quiz, session, onStart }: SessionOverviewProps) {
  const isSuspended = session.status === 'suspended';
  const meta = session.metadata;

  const answeredCount = meta?.answered?.length ?? 0;
  const totalQuestions = session.totalQuestions;
  const progressPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const scopeLabels: string[] = [];
  const scope = quiz.scopeFilter;
  if (scope?.subjectIds?.length) scopeLabels.push(`${scope.subjectIds.length} subject(s)`);
  if (scope?.moduleIds?.length) scopeLabels.push(`${scope.moduleIds.length} module(s)`);

  return (
    <div className="flex justify-center items-center p-6 min-h-full">
      <div className="space-y-6 w-full max-w-lg">
        {/* Title */}
        <div className="space-y-1 text-center">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
            {isSuspended ? 'Resume Test' : 'Test Overview'}
          </p>
          <h1 className="font-bold text-2xl">{quiz.title ?? 'Untitled Test'}</h1>
        </div>

        {/* Stats grid */}
        <div className="gap-3 grid grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-center gap-1 pt-4 pb-4">
              <BookOpen className="size-5 text-muted-foreground" />
              <span className="font-bold tabular-nums text-2xl">{totalQuestions}</span>
              <span className="text-muted-foreground text-xs">Questions</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 pt-4 pb-4">
              <HelpCircle className="size-5 text-muted-foreground" />
              <span className="font-bold tabular-nums text-2xl capitalize">
                {quiz.questionType ?? 'Mixed'}
              </span>
              <span className="text-muted-foreground text-xs">Type</span>
            </CardContent>
          </Card>
          {scopeLabels.length > 0 && (
            <Card className="col-span-2">
              <CardContent className="flex items-center gap-3 pt-4 pb-4">
                <Layers className="size-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Scope</p>
                  <p className="font-medium text-sm">{scopeLabels.join(', ')}</p>
                </div>
                {quiz.questionStatus && quiz.questionStatus !== 'all' && (
                  <Badge variant="secondary" className="ml-auto text-xs capitalize">
                    {quiz.questionStatus.replace('_', ' ')}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress (if resuming) */}
        {isSuspended && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Progress when suspended</span>
                <span className="font-semibold">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              <Progress value={progressPct} className="h-2" />
              {meta?.marked?.length ? (
                <p className="text-muted-foreground text-xs">
                  {meta.marked.length} question{meta.marked.length !== 1 ? 's' : ''} marked for review
                </p>
              ) : null}
            </div>
          </>
        )}

        {/* Start / Resume button */}
        <Button
          className="gap-2 w-full"
          size="lg"
          onClick={onStart}
        >
          {isSuspended ? (
            <>
              <RotateCcw className="size-4" />
              Resume Test
            </>
          ) : (
            <>
              <Play className="size-4" />
              Start Test
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
