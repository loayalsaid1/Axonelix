import { pgTable, text, timestamp, integer, uniqueIndex, serial } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { lessons } from "./lessons";
import { users } from "./users";
import { deckTypeEnum } from "./enums/flashcard-enums";
import { eq, sql } from "drizzle-orm";

export const flashcardDecks = pgTable("flashcard_decks", {
    id: serial("id").primaryKey().notNull(),
    lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    deckType: deckTypeEnum("deck_type").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    cardCount: integer("card_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
    uniqueIndex("idx_flashcard_decks_admin_lesson")
        .on(table.lessonId)
        .where(sql`${table.deckType} = 'ADMIN'`),
    uniqueIndex("idx_flashcard_decks_personal_lesson_user")
        .on(table.lessonId, table.userId)
        .where(sql`${table.deckType} = 'PERSONAL'`),
]);

export type FlashcardDeck = InferSelectModel<typeof flashcardDecks>;
export type NewFlashcardDeck = InferInsertModel<typeof flashcardDecks>;
