import { pgTable, serial, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const universities = pgTable("universities", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("universities_name_key").on(table.name),
]);
