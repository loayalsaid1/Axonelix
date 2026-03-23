import { pgTable, text, uuid, timestamp, real, index } from "drizzle-orm/pg-core";
import { flashcardDecks } from "./flashcard-decks";

export const flashcards = pgTable("flashcards", {
    id: uuid("id").primaryKey().defaultRandom(),
    deckId: uuid("deck_id").notNull().references(() => flashcardDecks.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    order: real("order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("idx_flashcards_deck_id").on(table.deckId),
]
);
