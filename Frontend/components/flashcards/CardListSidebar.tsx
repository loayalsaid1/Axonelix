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
}

export function CardListSidebar({ cards, currentIndex, onJumpToCard, className }: CardListSidebarProps) {
  return (
    <div className={cn("flex flex-col h-100 border rounded-xl bg-muted/30", className)}>
      <div className="p-4 border-b bg-muted/50 rounded-t-xl font-semibold text-sm">
        Deck Cards ({cards.length})
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {cards.map((card, index) => (
            <Button
              key={card.id}
              variant={index === currentIndex ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-normal truncate h-auto py-2",
                index === currentIndex && "bg-secondary shadow-sm font-medium"
              )}
              onClick={() => onJumpToCard(index)}
            >
              <div className="flex items-start gap-2 max-w-full">
                <span className="text-xs text-muted-foreground mt-0.5">{index + 1}.</span>
                <span className="truncate line-clamp-2 white-space-normal text-sm leading-tight">
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
