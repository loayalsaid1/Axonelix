import {
  pgTable,
  integer,
  boolean,
  timestamp,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { questions } from './questions';

/**
 * Denormalised per-user, per-question correctness status.
 *
 * Upserted inside every session COMPLETION transaction (quiz-sessions.service.ts).
 * One row exists at most per (user, question) pair — it always reflects the
 * result of the user's MOST RECENT completed attempt on that question.
 *
 * Semantics
 * ---------
 *  last_is_correct = false  →  question counts toward 'incorrect_only' filter
 *  last_is_correct = true   →  last attempt was correct, no longer 'incorrect'
 *  last_is_correct = NULL   →  written question not yet graded
 *  row absent               →  user has never answered this question  ('unread')
 *
 * This eliminates full quiz_session_answers scans for user-specific count
 * queries in the test generator.
 */
export const userQuestionStatus = pgTable(
  'user_question_status',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    questionId: integer('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),

    lastIsCorrect: boolean('last_is_correct'),

    attemptCount: integer('attempt_count').notNull().default(1),

    lastAnsweredAt: timestamp('last_answered_at', { mode: 'string' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.questionId] }),
    // Fast lookup for incorrect_only and unread filter counts
    index('idx_user_question_status_user_correct').on(
      table.userId,
      table.lastIsCorrect,
    ),
  ],
);

export type UserQuestionStatus    = typeof userQuestionStatus.$inferSelect;
export type NewUserQuestionStatus = typeof userQuestionStatus.$inferInsert;
