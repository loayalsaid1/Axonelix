"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FlashcardControlsProps {
  currentIndex: number;
  totalCards: number;
  isFirst: boolean;
  isLast: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function FlashcardControls({
  currentIndex,
  totalCards,
  isFirst,
  isLast,
  onNext,
  onPrev,
}: FlashcardControlsProps) {
  return (
    <div className="flex items-center justify-between w-full mt-6 space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={isFirst}
        className="w-12 h-12 rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous Card</span>
      </Button>

      <div className="flex items-center text-sm font-medium text-muted-foreground">
        {currentIndex + 1} / {totalCards}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={isLast}
        className="w-12 h-12 rounded-full"
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next Card</span>
      </Button>
    </div>
  );
}
