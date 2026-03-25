import { apiFetch, type FetchOptions } from "@/lib/api/client";
import { FlashcardDeck, Flashcard, CreateDeckDto, CreateCardDto, UpdateDeckDto, UpdateCardDto } from "@/lib/types/flashcards";

// -- Decks --

export async function getDecks(
  lessonId: number, 
  type?: "ADMIN" | "PERSONAL", 
  opts?: FetchOptions
): Promise<FlashcardDeck[]> {
  const params = new URLSearchParams({ lessonId: lessonId.toString() });
  if (type) {
    params.append("type", type);
  }
  return apiFetch<FlashcardDeck[]>(`/flashcards/decks?${params.toString()}`, opts);
}

export async function createDeck(
  deck: CreateDeckDto, 
  opts?: FetchOptions
): Promise<FlashcardDeck> {
  return apiFetch<FlashcardDeck>("/flashcards/decks", {
    method: "POST",
    body: deck,
    ...opts,
  });
}

export async function getDeck(id: number, opts?: FetchOptions): Promise<FlashcardDeck> {
  return apiFetch<FlashcardDeck>(`/flashcards/decks/${id}`, opts);
}

export async function updateDeck(
  id: number, 
  updates: UpdateDeckDto, 
  opts?: FetchOptions
): Promise<FlashcardDeck> {
  return apiFetch<FlashcardDeck>(`/flashcards/decks/${id}`, {
    method: "PATCH",
    body: updates,
    ...opts,
  });
}

export async function deleteDeck(id: number, opts?: FetchOptions): Promise<void> {
  return apiFetch<void>(`/flashcards/decks/${id}`, {
    method: "DELETE",
    ...opts,
  });
}

// -- Cards --

export async function getDeckCards(deckId: number, opts?: FetchOptions): Promise<{ deck: FlashcardDeck; cards: Flashcard[] }> {
  return apiFetch<{ deck: FlashcardDeck; cards: Flashcard[] }>(`/flashcards/decks/${deckId}/cards`, opts);
}

export async function createCards(
  deckId: number, 
  cards: CreateCardDto[], 
  opts?: FetchOptions
): Promise<Flashcard[]> {
  return apiFetch<Flashcard[]>(`/flashcards/decks/${deckId}/cards`, {
    method: "POST",
    body: { cards },
    ...opts,
  });
}

export async function updateCard(
  cardId: number, 
  updates: UpdateCardDto, 
  opts?: FetchOptions
): Promise<Flashcard> {
  return apiFetch<Flashcard>(`/flashcards/cards/${cardId}`, {
    method: "PATCH",
    body: updates,
    ...opts,
  });
}

export async function deleteCard(cardId: number, opts?: FetchOptions): Promise<void> {
  return apiFetch<void>(`/flashcards/cards/${cardId}`, {
    method: "DELETE",
    ...opts,
  });
}

export async function reorderCards(
  deckId: number, 
  cardIds: number[], 
  opts?: FetchOptions
): Promise<void> {
  return apiFetch<void>(`/flashcards/decks/${deckId}/cards/order`, {
    method: "PUT",
    body: { cardIds },
    ...opts,
  });
}
