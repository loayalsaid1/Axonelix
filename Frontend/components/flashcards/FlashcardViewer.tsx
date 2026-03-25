"use client";

import React from "react";
import { Flashcard as TypeFlashcard } from "@/lib/types/flashcards";
import { useFlashcardReviewer } from "@/hooks/useFlashcardReviewer";
import { Flashcard } from "./Flashcard";
import { FlashcardControls } from "./FlashcardControls";
import { CardListSidebar } from "./CardListSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface FlashcardViewerProps {
  cards: TypeFlashcard[];
  onAddCardClick?: () => void;
}

export function FlashcardViewer({ cards, onAddCardClick }: FlashcardViewerProps) {
  const {
    currentCard,
    currentIndex,
    isFlipped,
    nextCard,
    prevCard,
    jumpToCard,
    flipCard,
    isFirst,
    isLast,
    totalCards,
  } = useFlashcardReviewer(cards);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-100 border rounded-xl bg-card text-card-foreground shadow-sm">
        <p className="text-muted-foreground mb-4">No cards in this deck yet.</p>
        {onAddCardClick && (
          <Button onClick={onAddCardClick}>Create First Card</Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-5xl mx-auto py-6">
      {/* Mobile Sheet Trigger */}
      <div className="xl:hidden flex justify-end w-full mb-[-1rem]">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
              <Menu className="h-4 w-4" />
              Cards Index
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="mb-4">Deck Cards</SheetTitle>
            </SheetHeader>
            <CardListSidebar
              cards={cards}
              currentIndex={currentIndex}
              onJumpToCard={jumpToCard}
              className="h-[calc(100vh-8rem)] border-none"
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Center 3D Viewer & Controls */}
      <div className="flex-1 min-w-0 flex flex-col items-center w-full max-w-2xl mx-auto">
        <Flashcard
          front={currentCard?.front || ""}
          back={currentCard?.back || ""}
          isFlipped={isFlipped}
          onFlip={flipCard}
        />

        <FlashcardControls
          currentIndex={currentIndex}
          totalCards={totalCards}
          isFirst={isFirst}
          isLast={isLast}
          onNext={nextCard}
          onPrev={prevCard}
        />
        {onAddCardClick && (
          <div className="mt-8 flex justify-center w-full">
            <Button variant="secondary" onClick={onAddCardClick}>
              + Add New Card
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Sidebar List */}
      <div className="hidden xl:block w-75 shrink-0">
        <CardListSidebar
          cards={cards}
          currentIndex={currentIndex}
          onJumpToCard={jumpToCard}
        />
      </div>
    </div>
  );
}
