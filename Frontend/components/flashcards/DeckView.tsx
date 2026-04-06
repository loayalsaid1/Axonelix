"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FlashcardDeck, Flashcard } from "@/lib/types/flashcards";
import { FlashcardViewer } from "./FlashcardViewer";
import { CreateCardModal } from "./CreateCardModal";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface DeckViewProps {
  lessonId: number;
  deckType: "ADMIN" | "PERSONAL";
}

export function DeckView({ lessonId, deckType }: DeckViewProps) {
  const authFetch = useApiFetch();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDeckData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch decks for this lesson and type
      const decks = await authFetch<FlashcardDeck[]>(`/flashcards/decks?lessonId=${lessonId}&type=${deckType}`);
      
      if (decks && decks.length > 0) {
        const foundDeck = decks[0];
        setDeck(foundDeck);
        // Fetch cards for this deck
        const { cards: fetchedCards } = await authFetch<{ deck: FlashcardDeck; cards: Flashcard[] }>(`/flashcards/decks/${foundDeck.id}/cards`);
        setCards(fetchedCards || []);
      } else {
        setDeck(null);
        setCards([]);
      }
    } catch (error) {
      console.error("Failed to fetch deck data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, deckType, authFetch]);

  useEffect(() => {
    fetchDeckData();
  }, [fetchDeckData]);

  const handleCreateSuccess = (newCard: Flashcard, newDeckId?: number) => {
    if (newDeckId && !deck) {
      // If a deck was just created implicitly, re-fetch the entire deck status
      fetchDeckData();
    } else {
      // Otherwise just append the card
      setCards((prev) => [...prev, newCard]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4 py-6 max-w-2xl mx-auto">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="flex justify-between w-full mt-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  // Admin Empty State
  if (deckType === "ADMIN" && (!deck || cards.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card text-card-foreground shadow-sm h-[400px]">
        <h3 className="text-xl font-semibold mb-2">No Official Cards Yet</h3>
        <p className="text-muted-foreground">The administrative team hasn't added flashcards for this lesson.</p>
      </div>
    );
  }

  // Personal Empty State
  if (deckType === "PERSONAL" && (!deck || cards.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card text-card-foreground shadow-sm h-[400px]">
        <h3 className="text-xl font-semibold mb-2">My Personal Deck</h3>
        <p className="text-muted-foreground mb-6">You don't have any personal flashcards for this lesson yet. Create your first card to get started!</p>
        <Button onClick={() => setIsModalOpen(true)}>Create First Card</Button>
        <CreateCardModal
          lessonId={lessonId}
          existingDeckId={deck?.id}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={handleCreateSuccess}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <FlashcardViewer 
        cards={cards} 
        onAddCardClick={deckType === "PERSONAL" ? () => setIsModalOpen(true) : undefined} 
      />
      {deckType === "PERSONAL" && (
        <CreateCardModal
          lessonId={lessonId}
          existingDeckId={deck?.id}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
