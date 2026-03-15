'use client';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewNavigatorPanel } from './ReviewNavigatorPanel';
import type { ReviewFilter, ReviewEntry } from '@/lib/types/quizzes';

interface ReviewDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filter: ReviewFilter;
  onFilterChange: (filter: ReviewFilter) => void;
  entries: ReviewEntry[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

/**
 * Mobile navigation drawer for the session review interface.
 * Extracts the filtering and navigation logic from SessionReview for better modularity.
 */
export function ReviewDrawer({
  isOpen,
  onOpenChange,
  filter,
  onFilterChange,
  entries,
  currentIndex,
  onNavigate,
}: ReviewDrawerProps) {
  const handleNavigate = (index: number) => {
    onNavigate(index);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 h-[85vh] flex flex-col rounded-t-xl bg-card">
        <SheetHeader className="sr-only">
          <SheetTitle>Mobile Navigation & Filters</SheetTitle>
        </SheetHeader>

        {/* Header block with tabs purely for mobile context */}
        <div className="shrink-0 p-4 border-b border-border">
          <Tabs
            value={filter}
            onValueChange={(v) => onFilterChange(v as ReviewFilter)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="incorrect" className="text-xs">Incorrect</TabsTrigger>
              <TabsTrigger value="marked" className="text-xs">Marked</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Navigator Panel Content */}
        <div className="flex-1 overflow-hidden">
          <ReviewNavigatorPanel
            className="w-full border-none h-full bg-transparent"
            entries={entries}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
