"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export function Flashcard({ front, back, isFlipped, onFlip, className }: FlashcardProps) {
  return (
    <div
      className={cn("relative w-full h-100 perspective-[1000px]", className)}
      onClick={onFlip}
    >
      <div
        className={cn(
          "w-full h-full absolute transition-transform duration-500 transform-3d cursor-pointer text-base md:text-lg",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front Face */}
        <Card className="absolute flex flex-col items-center justify-center w-full h-full overflow-y-auto shadow-lg p-7 bg-card text-card-foreground backface-hidden">
          <div className="max-w-full max-h-full overflow-y-auto font-medium leading-relaxed text-center ">
            {front}
          </div>
          <div className="absolute text-xs opacity-50 bottom-4 text-muted-foreground shrink-0">
            Click to reveal
          </div>
        </Card>

        {/* Back Face */}
        <Card className="absolute flex flex-col items-center justify-center w-full h-full overflow-y-auto shadow-lg p-7 bg-card text-card-foreground backface-hidden rotate-y-180 hidden-scrollbar">
          <div className="max-w-full max-h-full overflow-y-auto leading-relaxed text-center hidden-scrollbar">
            {back}
          </div>
        </Card>
      </div>
    </div>
  );
}
