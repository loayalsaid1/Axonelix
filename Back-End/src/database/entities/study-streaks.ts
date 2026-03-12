import {
	pgTable,
	serial,
	integer,
	date,
	timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const studyStreaks = pgTable('study_streaks', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),

	currentStreak: integer('current_streak').notNull().default(0),
	longestStreak: integer('longest_streak').notNull().default(0),
	lastStudyDate: date('last_study_date', { mode: 'string' }),
	currentStreakStartDate: date('current_streak_start_date', { mode: 'string' }),

	updatedAt: timestamp('updated_at', { mode: 'string' }).default(
		sql`CURRENT_TIMESTAMP`,
	).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type StudyStreak = typeof studyStreaks.$inferSelect;
export type NewStudyStreak = typeof studyStreaks.$inferInsert;
