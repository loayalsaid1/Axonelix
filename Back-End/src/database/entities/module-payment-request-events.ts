import {
	pgTable,
	serial,
	integer,
	text,
	timestamp,
	foreignKey,
	index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { modulePaymentRequests, paymentRequestStatusEnum } from './module-payment-requests';
import { users } from './users';

export const modulePaymentRequestEvents = pgTable(
	'module_payment_request_events',
	{
		id: serial().primaryKey().notNull(),
		paymentRequestId: integer('payment_request_id').notNull(),
		fromStatus: paymentRequestStatusEnum('from_status'),
		toStatus: paymentRequestStatusEnum('to_status').notNull(),
		actorUserId: integer('actor_user_id').notNull(),
		note: text('note'),
		createdAt: timestamp('created_at', { mode: 'string' })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('idx_module_payment_request_events_request').on(table.paymentRequestId),
		foreignKey({
			columns: [table.paymentRequestId],
			foreignColumns: [modulePaymentRequests.id],
			name: 'module_payment_request_events_request_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.actorUserId],
			foreignColumns: [users.id],
			name: 'module_payment_request_events_actor_user_id_fkey',
		}).onDelete('cascade'),
	],
);
