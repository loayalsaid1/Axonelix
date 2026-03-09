import {
  pgTable,
  serial,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial().primaryKey().notNull(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ length: 50 }).notNull().default('student'),
  createdAt: timestamp('created_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});
