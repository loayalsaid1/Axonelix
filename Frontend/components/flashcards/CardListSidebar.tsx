"use client";

import React from "react";
import { Flashcard as TypeFlashcard } from "@/lib/types/flashcards";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CardListSidebarProps {
  cards: TypeFlashcard[];
  currentIndex: number;
  onJumpToCard: (index: number) => void;
  className?: string;
  isMobileSheet?: boolean;
}

export function CardListSidebar({ cards, currentIndex, onJumpToCard, className, isMobileSheet }: CardListSidebarProps) {
  return (
    <div className={cn("flex flex-col lg:flex-1 min-h-0 ", !isMobileSheet && "border rounded-xl bg-muted/30", className)}>
      {!isMobileSheet && (
        <div className="p-4 text-sm font-semibold border-b bg-muted/50 rounded-t-xl">
          Deck Cards ({cards.length})
        </div>
      )}
      <ScrollArea className="flex-1 h-0 [&_[data-radix-scroll-area-viewport]>div]:block! ">
        <div className={cn("space-y-1 p-2", isMobileSheet && "pr-4")}>
          {cards.map((card, index) => (
            <Button
              key={card.id}
              variant={index === currentIndex ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-normal py-2 h-auto",
                index === currentIndex && "bg-secondary shadow-sm font-medium"
              )}
              onClick={() => onJumpToCard(index)}
            >
              <div className="flex items-start w-full max-w-full gap-2 p-0 m-0 overflow-hidden">
                <span className="text-xs text-muted-foreground shrink-0 mt-[2px]">{index + 1}.</span>
                <span className="w-full text-sm truncate">
                  {card.front}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
