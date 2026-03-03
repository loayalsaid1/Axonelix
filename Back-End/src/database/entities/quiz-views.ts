import { pgView } from 'drizzle-orm/pg-core';
import { integer, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────────────────────────────────────────
// These views are defined in custom migration 0004_quiz_triggers_and_views.sql.
// Using `.existing()` tells Drizzle to reference them without attempting to
// create or manage them — they are owned by the SQL migration.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * For each (user, question) pair: the result of the user's most recent
 * *completed* session answer for that question.
 *
 * Used by quiz generation to implement the `incorrect_only` and `unread`
 * question-status filters.
 *
 * Columns
 * -------
 * userId          – the student
 * questionId      – the question attempted
 * lastIsCorrect   – true / false / NULL (written questions not yet graded)
 * lastAnsweredAt  – timestamp of that attempt
 */
export const vLatestUserQuestionStatus = pgView(
  'v_latest_user_question_status',
  {
    userId: integer('user_id').notNull(),
    questionId: integer('question_id').notNull(),
    lastIsCorrect: boolean('last_is_correct'),
    lastAnsweredAt: timestamp('last_answered_at', { mode: 'string' }),
  },
).existing();

/**
 * Aggregated per-user accuracy broken down by chapter and lesson.
 * Feeds the Performance / Analytics dashboard.
 *
 * Columns
 * -------
 * userId        – the student
 * chapterId     – may be NULL for old-exam-only questions
 * lessonId      – may be NULL for chapter-level or old-exam questions
 * totalAttempts
 * correctCount
 * accuracyPct   – 0–100, rounded to 2 d.p.
 */
export const vUserSubjectAccuracy = pgView(
  'v_user_subject_accuracy',
  {
    userId: integer('user_id').notNull(),
    chapterId: integer('chapter_id'),
    lessonId: integer('lesson_id'),
    totalAttempts: integer('total_attempts').notNull(),
    correctCount: integer('correct_count').notNull(),
    accuracyPct: numeric('accuracy_pct', { precision: 5, scale: 2 }),
  },
).existing();
