import {
	pgTable,
	serial,
	integer,
	varchar,
	text,
	date,
	boolean,
	timestamp,
	index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const plannerTasks = pgTable(
	'planner_tasks',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 255 }).notNull(),
		notes: text('notes'),
		dueDate: date('due_date', { mode: 'string' }).notNull(),
		isCompleted: boolean('is_completed').notNull().default(false),
		completedAt: timestamp('completed_at', { mode: 'string' }),
		createdAt: timestamp('created_at', { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at', { mode: 'string' })
			.default(sql`CURRENT_TIMESTAMP`)
			.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_planner_tasks_user_due_date').on(table.userId, table.dueDate),
		index('idx_planner_tasks_user_is_completed').on(table.userId, table.isCompleted),
	],
);

export type PlannerTask = typeof plannerTasks.$inferSelect;
export type NewPlannerTask = typeof plannerTasks.$inferInsert;
