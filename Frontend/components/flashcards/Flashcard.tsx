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
          "w-full h-full absolute transition-transform duration-500 transform-3d cursor-pointer",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front Face */}
        <Card className="absolute w-full h-full flex flex-col justify-center items-center p-8 bg-card text-card-foreground shadow-lg backface-hidden">
          <div className="text-xl font-medium text-center leading-relaxed">
            {front}
          </div>
          <div className="absolute bottom-4 text-xs text-muted-foreground opacity-50">
            Click to reveal
          </div>
        </Card>

        {/* Back Face */}
        <Card className="absolute w-full h-full flex flex-col justify-center items-center p-8 bg-card text-card-foreground shadow-lg backface-hidden rotate-y-180">
          <div className="text-xl text-center leading-relaxed">
            {back}
          </div>
        </Card>
      </div>
    </div>
  );
}
