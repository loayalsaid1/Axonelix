'use client';

import Link from 'next/link';
import { CheckCircle2, XCircle, MinusCircle, BookOpen, Clock, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Quiz, QuizSession } from '@/lib/types/quizzes';

function formatTime(secs: number | null): string {
  if (secs === null) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface SessionResultsProps {
  quiz: Quiz;
  session: QuizSession;
  onReview: () => void;
}

export function SessionResults({ quiz, session, onReview }: SessionResultsProps) {
  const score = session.scorePct ?? 0;
  const correct = session.correctCount ?? 0;
  const incorrect = session.incorrectCount ?? 0;
  const skipped = session.skippedCount ?? 0;
  const total = session.totalQuestions;

  const scoreColor =
    score >= 70
      ? 'text-emerald-600 dark:text-emerald-400'
      : score >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-destructive';

  const scoreBg =
    score >= 70
      ? 'bg-emerald-500'
      : score >= 50
        ? 'bg-amber-500'
        : 'bg-destructive';

  return (
    <div className="flex justify-center items-center p-6 min-h-full">
      <div className="space-y-6 w-full max-w-lg">
        {/* Header */}
        <div className="space-y-1 text-center">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
            Test Complete
          </p>
          <h1 className="font-bold text-2xl">{quiz.title ?? 'Untitled Test'}</h1>
        </div>

        {/* Score ring */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div
            className={cn(
              'flex justify-center items-center border-4 rounded-full w-28 h-28 font-bold tabular-nums text-4xl',
              score >= 70
                ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : score >= 50
                  ? 'border-amber-500/40 text-amber-600 dark:text-amber-400'
                  : 'border-destructive/40 text-destructive',
            )}
          >
            {Math.round(score)}%
          </div>
          <Progress value={score} className={cn('w-48 h-2', '[&>div]:' + scoreBg)} />
          <p className="text-muted-foreground text-sm">
            {score >= 70 ? 'Great work!' : score >= 50 ? 'Keep practising.' : 'Needs more review.'}
          </p>
        </div>

        {/* Stats */}
        <div className="gap-3 grid grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-1 pt-4 pb-4">
              <CheckCircle2 className="size-5 text-emerald-500" />
              <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400 text-2xl">
                {correct}
              </span>
              <span className="text-muted-foreground text-xs">Correct</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 pt-4 pb-4">
              <XCircle className="size-5 text-destructive" />
              <span className="font-bold tabular-nums text-destructive text-2xl">
                {incorrect}
              </span>
              <span className="text-muted-foreground text-xs">Incorrect</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 pt-4 pb-4">
              <MinusCircle className="size-5 text-muted-foreground" />
              <span className="font-bold tabular-nums text-muted-foreground text-2xl">
                {skipped}
              </span>
              <span className="text-muted-foreground text-xs">Skipped</span>
            </CardContent>
          </Card>
        </div>

        {/* Meta info */}
        <Card>
          <CardContent className="space-y-2.5 pt-4 pb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="size-4" /> Questions
              </span>
              <span className="font-medium">{total}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" /> Time Taken
              </span>
              <span className="font-medium">{formatTime(session.timeTakenSecs)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <BarChart2 className="size-4" /> Avg per question
              </span>
              <span className="font-medium">
                {session.timeTakenSecs && total > 0
                  ? formatTime(Math.round(session.timeTakenSecs / total))
                  : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/qbank/my-tests">View All Tests</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/qbank/generate-tests">New Test</Link>
          </Button>
        </div>

        <Button className="gap-2 w-full" onClick={onReview}>
          Review Answers &amp; Explanations
        </Button>
      </div>
    </div>
  );
}
