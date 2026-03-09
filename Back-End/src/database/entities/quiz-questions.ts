import { pgTable, integer, primaryKey, index } from 'drizzle-orm/pg-core';
import { quizzes } from './quizzes';
import { questions } from './questions';

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Inserts/updates/deletes on this table are monitored by the database
// trigger `trg_sync_quiz_question_ids` (function: sync_quiz_question_ids),
// which automatically keeps `quizzes.question_ids` and
// `quizzes.total_questions` in sync.
//
// Defined in custom migration: 0004_quiz_triggers_and_views.sql
// ─────────────────────────────────────────────────────────────────────────────

export const quizQuestions = pgTable(
  'quiz_questions',
  {
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id, { onDelete: 'cascade' }),
    questionId: integer('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.quizId, table.questionId] }),
    index('idx_quiz_questions_quiz').on(table.quizId),
    index('idx_quiz_questions_qid').on(table.questionId),
  ],
);
