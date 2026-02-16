import { pgTable, serial, varchar, text, integer, timestamp, index, foreignKey, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { subjects } from "./subjects";

export const chapters = pgTable("chapters", {
	id: serial().primaryKey().notNull(),
	subjectId: integer("subject_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	isMiscellaneous: boolean("is_miscellaneous").default(false),
	orderIndex: integer("order_index"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_chapters_misc").using("btree", table.isMiscellaneous.asc().nullsLast().op("bool_ops")).where(sql`(is_miscellaneous = true)`),
	index("idx_chapters_subject").using("btree", table.subjectId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "chapters_subject_id_fkey"
		}).onDelete("cascade"),
]);
