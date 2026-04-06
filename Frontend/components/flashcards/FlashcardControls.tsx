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
    <div className="flex items-center justify-between w-full max-w-sm mt-6 p-2 rounded-xl bg-muted/30 border">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={isFirst}
        className="gap-2 px-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev Card
      </Button>

      <div className="flex items-center text-sm font-medium text-muted-foreground select-none">
        {currentIndex + 1} / {totalCards}
      </div>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={isLast}
        className="gap-2 px-4"
      >
        Next Card
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
