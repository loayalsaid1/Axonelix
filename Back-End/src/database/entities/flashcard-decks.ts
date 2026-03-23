import { pgTable, text, uuid, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { lessons } from "./lessons";
import { users } from "./users";
import { deckTypeEnum } from "./enums/flashcard-enums";
import { eq, sql } from "drizzle-orm";

export const flashcardDecks = pgTable("flashcard_decks", {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    deckType: deckTypeEnum("deck_type").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    cardCount: integer("card_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
    uniqueIndex("idx_flashcard_decks_admin_lesson")
        .on(table.lessonId)
        .where(eq(table.deckType, 'ADMIN')),
    uniqueIndex("idx_flashcard_decks_personal_lesson_user")
        .on(table.lessonId, table.userId)
        .where(eq(table.deckType, 'PERSONAL')),
]);
