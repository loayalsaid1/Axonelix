'use client';

import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReviewFilter, Quiz } from '@/lib/types/quizzes';

interface ReviewTopBarProps {
  quiz: Quiz;
  /** Current absolute index in the filtered entry list */
  currentIndex: number;
  /** Total entries in the currently active filter */
  totalEntries: number;
  activeFilter: ReviewFilter;
  onFilterChange: (filter: ReviewFilter) => void;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function ReviewTopBar({
  quiz,
  currentIndex,
  totalEntries,
  activeFilter,
  onFilterChange,
  onPrev,
  onNext,
  onBack,
}: ReviewTopBarProps) {
  const isFirst = currentIndex === 0;
  const isLast  = currentIndex >= totalEntries - 1;

  return (
    <header className="flex items-center gap-4 bg-card px-4 md:px-6 border-border border-b h-14 shrink-0">
      {/* Back */}
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs shrink-0" onClick={onBack}>
        <ArrowLeft className="size-3.5" />
        <span className="hidden sm:inline">Results</span>
      </Button>

      {/* Title */}
      <div className="flex items-center gap-2 min-w-0">
        <BookOpen className="size-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm truncate">
          {quiz.title ?? 'Untitled Test'} — Review
        </span>
      </div>

      {/* Filter tabs */}
      <div className="hidden md:flex flex-1 justify-center">
        <Tabs
          value={activeFilter}
          onValueChange={(v) => onFilterChange(v as ReviewFilter)}
        >
          <TabsList className="h-8">
            <TabsTrigger value="all"       className="px-3 h-6 text-xs">All</TabsTrigger>
            <TabsTrigger value="incorrect" className="px-3 h-6 text-xs">Incorrect</TabsTrigger>
            <TabsTrigger value="marked"    className="px-3 h-6 text-xs">Marked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="md:hidden flex-1" />

      {/* Navigation */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button variant="outline" size="icon" className="size-8" onClick={onPrev} disabled={isFirst}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-14 tabular-nums text-muted-foreground text-xs text-center">
          {totalEntries === 0 ? '—' : `${currentIndex + 1} / ${totalEntries}`}
        </span>
        <Button variant="outline" size="icon" className="size-8" onClick={onNext} disabled={isLast}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </header>
  );
}
