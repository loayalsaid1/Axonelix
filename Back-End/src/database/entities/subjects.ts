import { pgTable, serial, varchar, text, integer, timestamp, index, foreignKey, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { modules } from "./modules";

export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	moduleId: integer("module_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	description: text(),
	orderIndex: integer("order_index"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_subjects_module").using("btree", table.moduleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "subjects_module_id_fkey"
		}).onDelete("cascade"),
	check("subjects_type_check", sql`(type)::text = ANY ((ARRAY['theoretical'::character varying, 'practical'::character varying])::text[])`),
]);
