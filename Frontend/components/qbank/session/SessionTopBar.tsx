'use client';

import { useState } from 'react';
import { PauseCircle, StopCircle, ChevronRight, BookOpen, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { Quiz, QuizSession } from '@/lib/types/quizzes';

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface SessionTopBarProps {
  quiz: Quiz;
  session: QuizSession;
  currentIndex: number;
  totalAnswered: number;
  elapsedSecs: number;
  showAllAnswers?: boolean;
  onToggleShowAllAnswers?: () => void;
  onSuspend: () => void;
  onEnd: () => void;
}

export function SessionTopBar({
  quiz,
  session,
  currentIndex,
  totalAnswered,
  elapsedSecs,
  showAllAnswers,
  onToggleShowAllAnswers,
  onSuspend,
  onEnd,
}: SessionTopBarProps) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const total = session.totalQuestions;
  const progressPct = total > 0 ? (totalAnswered / total) * 100 : 0;

  return (
    <>
      <header className="flex items-center gap-4 bg-card px-4 md:px-6 border-border border-b h-14 shrink-0">
        {/* Title */}
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="size-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm truncate">
            {quiz.title ?? 'Untitled Test'}
          </span>
        </div>

        {/* Progress */}
        <div className="hidden md:flex flex-col gap-0.5 min-w-32">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
            <span>
              Q {currentIndex + 1} / {total}
            </span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        {/* Answered count */}
        <div className="hidden md:flex flex-col items-center text-center shrink-0">
          <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
            Answered
          </span>
          <span className="font-bold tabular-nums text-sm">
            {totalAnswered}
            <span className="font-normal text-muted-foreground">/{total}</span>
          </span>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center text-center shrink-0">
          <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
            Time
          </span>
          <span className="font-mono font-semibold tabular-nums text-sm">
            {formatTime(elapsedSecs)}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls */}
        <div className="flex items-center gap-2">
          {onToggleShowAllAnswers && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  variant="outline"
                  size="sm"
                  pressed={showAllAnswers}
                  onPressedChange={onToggleShowAllAnswers}
                  className="gap-1.5 text-xs data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
                >
                  <span className="hidden sm:inline">Show Answers</span>
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">Show answers for all questions</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={onSuspend}
              >
                <PauseCircle className="size-3.5" />
                <span className="hidden sm:inline">Suspend</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Save & exit — resume later</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setConfirmEnd(true)}
              >
                <StopCircle className="size-3.5" />
                <span className="hidden sm:inline">End Test</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Submit and view results</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Confirm end dialog */}
      <Dialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>End this test?</DialogTitle>
            <DialogDescription>
              {totalAnswered === total
                ? 'All questions answered. Your results will be calculated.'
                : `You've answered ${totalAnswered} of ${total} questions. Unanswered questions will be marked as skipped.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmEnd(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmEnd(false);
                onEnd();
              }}
            >
              End & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
