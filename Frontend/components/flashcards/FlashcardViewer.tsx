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
      <div className="flex flex-col items-center justify-center border shadow-sm h-100 rounded-xl bg-card text-card-foreground">
        <p className="mb-4 text-muted-foreground">No cards in this deck yet.</p>
        {onAddCardClick && (
          <Button onClick={onAddCardClick}>Create First Card</Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-5xl gap-6 py-6 mx-auto xl:flex-row">
      {/* Mobile/Tablet Action Bar */}
      <div className="flex items-center justify-between w-full xl:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
              <Menu className="w-4 h-4" />
              Cards List
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[85vw] sm:w-[400px] flex flex-col">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle>Deck Cards</SheetTitle>
            </SheetHeader>
            <CardListSidebar
              cards={cards}
              currentIndex={currentIndex}
              onJumpToCard={jumpToCard}
              className="flex-1"
              isMobileSheet={true}
            />
          </SheetContent>
        </Sheet>

        {onAddCardClick && (
          <Button size="sm" onClick={onAddCardClick}>
            + Add Card
          </Button>
        )}
      </div>

      {/* Center 3D Viewer & Controls */}
      <div className="flex flex-col items-center flex-1 w-full max-w-2xl min-w-0 mx-auto">
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
      </div>

      {/* Desktop Sidebar List */}
      <div className="flex-col hidden gap-4 xl:flex w-75  h-120 min-h-0 shrink-0">
        {onAddCardClick && (
          <Button onClick={onAddCardClick} className="w-full">
            + New Card
          </Button>
        )}
        <CardListSidebar
          cards={cards}
          currentIndex={currentIndex}
          onJumpToCard={jumpToCard}
        />
      </div>
    </div>
  );
}
