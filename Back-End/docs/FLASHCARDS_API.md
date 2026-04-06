# Flashcards API Reference

Base path for all flashcards endpoints: `/flashcards`

## Decks API

Base route: `/flashcards/decks`

### 1. Create a Deck
- **Method:** `POST`
- **Route:** `/`
- **Body:**
  ```json
  {
    "lessonId": 1,
    "deckType": "ADMIN", // or "PERSONAL"
    "name": "Anatomy Basics",
    "description": "Optional description"
  }
  ```
- **Response:** Returns the newly created `FlashcardDeck`.
- **Note:** For `PERSONAL` decks, the `userId` is automatically populated from the authenticated user.

### 2. Get All Decks for a Lesson
- **Method:** `GET`
- **Route:** `/`
- **Query Parameters:**
  - `lessonId` (required, integer)
  - `type` (optional, string: `"ADMIN"` or `"PERSONAL"`)
- **Response:** Returns an array of `FlashcardDeck`s. 
- **Note:** If no `type` is specified, it fetches `ADMIN` decks and the `PERSONAL` decks belonging to the authenticated user.

### 3. Get a Specific Deck
- **Method:** `GET`
- **Route:** `/:id`
- **Path Parameter:** `id` (Deck ID)
- **Response:** Returns the `FlashcardDeck`.
- **Authorization:** `DeckMutationGuard` prevents users from viewing `PERSONAL` decks that do not belong to them.

### 4. Update a Deck
- **Method:** `PATCH`
- **Route:** `/:id`
- **Path Parameter:** `id` (Deck ID)
- **Body:** (Partial deck fields)
  ```json
  {
    "name": "Updated Anatomy Basics"
  }
  ```
- **Response:** Returns the updated `FlashcardDeck`.
- **Authorization:** `DeckMutationGuard` enforces that only admins can update `ADMIN` decks, and only the owner can update `PERSONAL` decks.

### 5. Delete a Deck
- **Method:** `DELETE`
- **Route:** `/:id`
- **Path Parameter:** `id` (Deck ID)
- **Response:** `{ "success": true }`
- **Authorization:** `DeckMutationGuard` applies.

---

## Cards API

Base route: `/flashcards`

### 1. Add Cards to a Deck
- **Method:** `POST`
- **Route:** `/decks/:deckId/cards`
- **Path Parameter:** `deckId`
- **Body:**
  ```json
  {
    "cards": [
      { "front": "Question 1?", "back": "Answer 1", "order": 0 },
      { "front": "Question 2?", "back": "Answer 2", "order": 1 }
    ]
  }
  ```
- **Response:** Returns an array of the newly created `Flashcard`s.
- **Authorization:** `DeckMutationGuard` applies.

### 2. Get All Cards in a Deck
- **Method:** `GET`
- **Route:** `/decks/:deckId/cards`
- **Path Parameter:** `deckId`
- **Response:** 
  ```json
  {
    "deck": { /* FlashcardDeck object */ },
    "cards": [ /* Array of Flashcard objects */ ]
  }
  ```
- **Authorization:** `DeckMutationGuard` applies.

### 3. Reorder Cards in a Deck
- **Method:** `PUT`
- **Route:** `/decks/:deckId/cards/order`
- **Path Parameter:** `deckId`
- **Body:**
  ```json
  {
    "cardIds": [3, 1, 2] // Array of card IDs in the desired new order
  }
  ```
- **Response:** `{ "success": true }`
- **Authorization:** `DeckMutationGuard` applies.

### 4. Get a Specific Card
- **Method:** `GET`
- **Route:** `/cards/:id`
- **Path Parameter:** `id` (Card ID)
- **Response:** Returns the `Flashcard`.
- **Authorization:** `CardMutationGuard` prevents users from viewing cards inside `PERSONAL` decks that do not belong to them.

### 5. Update a Specific Card
- **Method:** `PATCH`
- **Route:** `/cards/:id`
- **Path Parameter:** `id` (Card ID)
- **Body:** (Partial card fields)
  ```json
  {
    "front": "Updated Question",
    "back": "Updated Answer"
  }
  ```
- **Response:** Returns the updated `Flashcard`.
- **Authorization:** `CardMutationGuard` applies.

### 6. Delete a Specific Card
- **Method:** `DELETE`
- **Route:** `/cards/:id`
- **Path Parameter:** `id` (Card ID)
- **Response:** `{ "success": true }`
- **Authorization:** `CardMutationGuard` applies.

---

## Authorization Guards
- **`DeckMutationGuard`**: Applied to deck-level routes. Ensures that operations on a deck can only be performed by authorized users. For `ADMIN` decks, the user must have an admin role. For `PERSONAL` decks, the user must be the owner.
- **`CardMutationGuard`**: Applied to individual card routes (`/cards/:id`). It dynamically finds the deck associated with the card and applies the exact same ownership and admin rules as the `DeckMutationGuard`.
