import { pgTable, serial, varchar, text, integer, timestamp, index, foreignKey, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { chapters } from "./chapters";

export const lessons = pgTable("lessons", {
	id: serial().primaryKey().notNull(),
	chapterId: integer("chapter_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	content: jsonb(),
	isLegacyFormat: boolean("is_legacy_format").default(false).notNull(),
	orderIndex: integer("order_index"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_lessons_chapter").using("btree", table.chapterId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "lessons_chapter_id_fkey"
		}).onDelete("cascade"),
]);
