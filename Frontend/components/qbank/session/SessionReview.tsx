'use client';

import { useState, useMemo, useCallback } from 'react';
import { ReviewTopBar } from './ReviewTopBar';
import { ReviewQuestionCard } from './ReviewQuestionCard';
import { ReviewNavigatorPanel } from './ReviewNavigatorPanel';
import { buildReviewEntries } from '@/lib/types/quizzes';
import type { ReviewFilter, SessionDetail } from '@/lib/types/quizzes';

interface SessionReviewProps {
  sessionDetail: SessionDetail;
  onBack: () => void;
}

/**
 * Full-screen read-only review interface for a completed session.
 *
 * State:
 *   filter       — which subset of questions to show
 *   currentIndex — index into the *filtered* entry list
 *
 * Data is derived entirely from the already-loaded SessionDetail (no extra
 * API calls needed — the backend included isCorrect on every SessionAnswer
 * and explanation on every QuizQuestion at completion time).
 */
export function SessionReview({ sessionDetail, onBack }: SessionReviewProps) {
  const [filter, setFilter]         = useState<ReviewFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build full entry list once
  const allEntries = useMemo(
    () => buildReviewEntries(sessionDetail),
    [sessionDetail],
  );

  // Apply filter
  const entries = useMemo(() => {
    if (filter === 'all') return allEntries;
    if (filter === 'incorrect')
      return allEntries.filter((e) => e.isCorrect === false);
    if (filter === 'marked')
      return allEntries.filter((e) => !!e.answer?.isMarked);
    return allEntries;
  }, [allEntries, filter]);

  const currentEntry = entries[currentIndex] ?? null;

  // Reset index when filter changes
  const handleFilterChange = useCallback((next: ReviewFilter) => {
    setFilter(next);
    setCurrentIndex(0);
  }, []);

  const goTo   = useCallback((i: number) => setCurrentIndex(i), []);
  const goPrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setCurrentIndex((i) => Math.min(entries.length - 1, i + 1)),
    [entries.length],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <ReviewTopBar
        quiz={sessionDetail.quiz}
        currentIndex={currentIndex}
        totalEntries={entries.length}
        activeFilter={filter}
        onFilterChange={handleFilterChange}
        onPrev={goPrev}
        onNext={goNext}
        onBack={onBack}
      />

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Scrollable question area */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-6 mx-auto px-4 md:px-8 py-8 max-w-3xl">
            {currentEntry ? (
              <ReviewQuestionCard entry={currentEntry} />
            ) : (
              <div className="flex flex-col justify-center items-center gap-3 py-20 text-center">
                <p className="font-medium text-muted-foreground">
                  No questions match this filter.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Side navigator (hidden on small screens) */}
        <div className="hidden lg:block shrink-0">
          <ReviewNavigatorPanel
            entries={entries}
            currentIndex={currentIndex}
            onNavigate={goTo}
          />
        </div>
      </div>
    </div>
  );
}
