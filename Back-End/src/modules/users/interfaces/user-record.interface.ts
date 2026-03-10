import { users } from '../../../database/entities/users';

/** Derived directly from the Drizzle schema — single source of truth. */
export type UserRecord = typeof users.$inferSelect;
