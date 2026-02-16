import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const cats = pgTable('cats', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	age: integer('age').notNull(),
	breed: text('breed'),
});

export type Cat = typeof cats.$inferSelect;
export type NewCat = typeof cats.$inferInsert;
