import {
	pgTable,
	serial,
	integer,
	varchar,
	timestamp,
	index,
	foreignKey,
	uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { modules } from './modules';

export const userModuleAccess = pgTable(
	'user_module_access',
	{
		id: serial().primaryKey().notNull(),
		userId: integer('user_id').notNull(),
		moduleId: integer('module_id').notNull(),
		source: varchar({ length: 50 }).notNull().default('manual_payment'),
		grantedBy: integer('granted_by'),
		grantedAt: timestamp('granted_at', { mode: 'string' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		revokedAt: timestamp('revoked_at', { mode: 'string' }),
	},
	(table) => [
		index('idx_user_module_access_module_user').on(table.moduleId, table.userId),
		index('idx_user_module_access_user').on(table.userId),
		uniqueIndex('uq_user_module_access_active')
			.on(table.userId, table.moduleId)
			.where(sql`revoked_at IS NULL`),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'user_module_access_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: 'user_module_access_module_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.grantedBy],
			foreignColumns: [users.id],
			name: 'user_module_access_granted_by_fkey',
		}).onDelete('set null'),
	],
);
