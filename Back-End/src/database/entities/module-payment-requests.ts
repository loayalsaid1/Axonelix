import {
	pgTable,
	serial,
	integer,
	text,
	timestamp,
	index,
	foreignKey,
	pgEnum,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { modules } from './modules';
import { images } from './images';

export const paymentRequestStatusEnum = pgEnum('payment_request_status', [
	'pending',
	'approved',
	'rejected',
	'canceled',
]);

export const modulePaymentRequests = pgTable(
	'module_payment_requests',
	{
		id: serial().primaryKey().notNull(),
		userId: integer('user_id').notNull(),
		moduleId: integer('module_id').notNull(),
		status: paymentRequestStatusEnum('status').notNull().default('pending'),
		proofImageId: uuid('proof_image_id'),
		submitNote: text('submit_note'),
		reviewNote: text('review_note'),
		reviewedBy: integer('reviewed_by'),
		reviewedAt: timestamp('reviewed_at', { mode: 'string' }),
		moduleFeePiasters: integer('module_fee_piasters').notNull().default(20000),
		createdAt: timestamp('created_at', { mode: 'string' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at', { mode: 'string' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
			.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_module_payment_requests_status').on(table.status),
		index('idx_module_payment_requests_user').on(table.userId),
		index('idx_module_payment_requests_module').on(table.moduleId),
		uniqueIndex('uq_module_payment_requests_pending_user_module')
			.on(table.userId, table.moduleId)
			.where(sql`status = 'pending'`),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'module_payment_requests_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: 'module_payment_requests_module_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.proofImageId],
			foreignColumns: [images.id],
			name: 'module_payment_requests_proof_image_id_fkey',
		}).onDelete('set null'),
		foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: 'module_payment_requests_reviewed_by_fkey',
		}).onDelete('set null'),
	],
);
