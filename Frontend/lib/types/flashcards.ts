export type DeckType = "ADMIN" | "PERSONAL";

export interface FlashcardDeck {
  id: number;
  lessonId: number;
  userId: number | null;
  deckType: DeckType;
  name: string;
  description: string | null;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: number;
  deckId: number;
  front: string;
  back: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeckDto {
  lessonId: number;
  deckType: DeckType;
  name: string;
  description?: string;
}

export interface CreateCardDto {
  front: string;
  back: string;
  order?: number;
}

export interface UpdateDeckDto {
  name?: string;
  description?: string;
}

export interface UpdateCardDto {
  front?: string;
  back?: string;
}
