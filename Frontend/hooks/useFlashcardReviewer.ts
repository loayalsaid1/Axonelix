import { useState, useCallback } from "react";
import { Flashcard } from "@/lib/types/flashcards";

export function useFlashcardReviewer(cards: Flashcard[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150); // slight delay to unflipping before swapping text
    }
  }, [currentIndex, cards.length]);

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const jumpToCard = useCallback((index: number) => {
    if (index >= 0 && index < cards.length) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(index), 150);
    }
  }, [cards.length]);

  return {
    currentIndex,
    currentCard: cards[currentIndex] || null,
    isFlipped,
    nextCard,
    prevCard,
    flipCard,
    jumpToCard,
    isFirst: currentIndex === 0,
    isLast: currentIndex === cards.length - 1,
    totalCards: cards.length,
  };
}
