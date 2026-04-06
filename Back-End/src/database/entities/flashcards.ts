import { pgTable, text, timestamp, real, index, serial, integer } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { flashcardDecks } from "./flashcard-decks";

export const flashcards = pgTable("flashcards", {
    id: serial("id").primaryKey().notNull(),
    deckId: integer("deck_id").notNull().references(() => flashcardDecks.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    order: real("order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("idx_flashcards_deck_id").on(table.deckId),
]);

export type Flashcard = InferSelectModel<typeof flashcards>;
export type NewFlashcard = InferInsertModel<typeof flashcards>;
