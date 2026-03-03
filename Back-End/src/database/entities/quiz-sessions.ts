import {
  pgTable,
  serial,
  integer,
  timestamp,
  numeric,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { quizzes } from './quizzes';
import { users } from './users';
import { quizSessionStatusEnum } from './enums/quiz-enums';

export const quizSessions = pgTable(
  'quiz_sessions',
  {
    id: serial().primaryKey(),

    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // not_started : quiz generated, user redirected – timer not yet running
    // in_progress : user clicked "Start"
    // suspended   : user clicked "Suspend"
    // completed   : user clicked "End" or answered all questions
    status: quizSessionStatusEnum().notNull().default('not_started'),

    startedAt: timestamp('started_at', { mode: 'string' }),
    endedAt: timestamp('ended_at', { mode: 'string' }),
    timeTakenSecs: integer('time_taken_secs'),

    totalQuestions: integer('total_questions').notNull().default(0),
    correctCount: integer('correct_count').notNull().default(0),
    incorrectCount: integer('incorrect_count').notNull().default(0),
    skippedCount: integer('skipped_count').notNull().default(0),
    scorePct: numeric('score_pct', { precision: 5, scale: 2 }),

    // {
    //   "answered":            [id, ...],
    //   "unanswered":          [id, ...],
    //   "unseen":              [id, ...],
    //   "marked":              [id, ...],
    //   "current_question_id": id
    // }
    metadata: jsonb().notNull().default(sql`'{}'::jsonb`),

    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_quiz_sessions_user').on(table.userId),
    index('idx_quiz_sessions_quiz').on(table.quizId),
    index('idx_quiz_sessions_status').on(table.userId, table.status),
  ],
);
