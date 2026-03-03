import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { oldExams } from './old-exams';
import { quizQuestionTypeEnum, quizQuestionStatusEnum } from './enums/quiz-enums';

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: `question_ids` is kept in sync by the database trigger:
//
//   Migration: 0004_quiz_triggers_and_views.sql
//   Trigger:   trg_sync_quiz_question_ids  /  Function: sync_quiz_question_ids()
//
// `total_questions` is a GENERATED STORED column – Postgres computes it
// automatically as COALESCE(array_length(question_ids, 1), 0).

// DO NOT write to any of these columns from application code.
// ─────────────────────────────────────────────────────────────────────────────

export const quizzes = pgTable(
  'quizzes',
  {
    id: serial().primaryKey(),

    title: text(),
    description: text(),

    createdBy: integer('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // NULL  → custom QBank quiz
    // set   → this quiz wraps an Old Exam
    oldExamId: integer('old_exam_id').references(() => oldExams.id, {
      onDelete: 'set null',
    }),

    // e.g. { "moduleId": 1, "subjectId": 2, "chapterId": 3, "lessonId": 4 }
    scopeFilter: jsonb('scope_filter').notNull().default(sql`'{}'::jsonb`),

    questionType: quizQuestionTypeEnum('question_type'),
    questionStatus: quizQuestionStatusEnum('question_status'),

    // Kept in sync by trigger – do not write manually
    questionIds: integer('question_ids')
      .array()
      .notNull()
      .default(sql`ARRAY[]::integer[]`),

    // Generated stored column – Postgres keeps this in sync automatically
    totalQuestions: integer('total_questions').generatedAlwaysAs(
      sql`COALESCE(array_length(question_ids, 1), 0)`,
    ),

    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_quizzes_created_by').on(table.createdBy),
    index('idx_quizzes_old_exam')
      .on(table.oldExamId)
      .where(sql`old_exam_id IS NOT NULL`),
  ],
);
