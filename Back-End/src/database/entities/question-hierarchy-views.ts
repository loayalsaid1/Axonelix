import { pgView, pgMaterializedView } from 'drizzle-orm/pg-core';
import { integer, boolean, varchar, text } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';
import { questions } from './questions';
import { lessons } from './lessons';
import { chapters } from './chapters';
import { subjects } from './subjects';

/**
 * Flat denormalised ancestry map — one row per question.
 *
 * Resolves the full parentage of every question in a single table scan,
 * eliminating the 4-table join chain (questions → lessons → chapters →
 * subjects → modules) from count and filter queries.
 *
 * Question attachment cases (from DB constraints):
 *  • lesson_id  set, is_misc = false  → standard lesson question
 *  • chapter_id set, is_misc = true   → misc chapter question (no lesson)
 *  • old_exam_id set                  → old-exam question (no hierarchy)
 *
 * The COALESCE on chapter_id unifies both cases:
 *  lesson questions : chapter comes from lessons.chapter_id
 *  misc  questions  : chapter_id is set directly on questions
 */
export const vwQuestionAncestry = pgView('vw_question_ancestry').as((qb) =>
  qb
    .select({
      questionId:   questions.id,
      questionType: questions.questionType,
      isMisc:       questions.isMisc,
      oldExamId:    questions.oldExamId,
      lessonId:     questions.lessonId,
      // Unified chapter: direct (misc) or via lesson row
      chapterId:    sql<number | null>`COALESCE(${questions.chapterId}, ${lessons.chapterId})`.as('chapter_id'),
      subjectId:    chapters.subjectId,
      subjectType:  subjects.type,
      moduleId:     subjects.moduleId,
    })
    .from(questions)
    .leftJoin(lessons,  eq(lessons.id,   questions.lessonId))
    .leftJoin(chapters, eq(chapters.id,  sql`COALESCE(${questions.chapterId}, ${lessons.chapterId})`  ))
    .leftJoin(subjects, eq(subjects.id,  chapters.subjectId))
);

/**
 * Precomputed question counts per hierarchy entity (materialised).
 *
 * Shape: one row per (entity_type, entity_id) pair.
 *  entity_type : 'module' | 'subject' | 'chapter' | 'lesson'
 *  entity_id   : the ID of that entity
 *  questionCount : total questions under that node
 *
 * Refreshed automatically after any questions INSERT/UPDATE/DELETE by
 * trg_refresh_question_counts.
 * A UNIQUE index on (entity_type, entity_id) — also in migration 0007 —
 * is required to enable REFRESH MATERIALIZED VIEW CONCURRENTLY.
 *
 * Used by the hierarchy-selector UI to show count badges; no user dimension.
 */
export const vwQuestionCounts = pgMaterializedView('vw_question_counts', {
  entityType:    text('entity_type').notNull(),
  entityId:      integer('entity_id').notNull(),
  questionCount: integer('question_count').notNull(),
}).as(sql`
  SELECT 'module'::text  AS entity_type,
         module_id       AS entity_id,
         COUNT(*)::int   AS question_count
  FROM   vw_question_ancestry
  WHERE  module_id IS NOT NULL
  GROUP  BY module_id

  UNION ALL

  SELECT 'subject', subject_id, COUNT(*)::int
  FROM   vw_question_ancestry
  WHERE  subject_id IS NOT NULL
  GROUP  BY subject_id

  UNION ALL

  SELECT 'chapter', chapter_id, COUNT(*)::int
  FROM   vw_question_ancestry
  WHERE  chapter_id IS NOT NULL
  GROUP  BY chapter_id

  UNION ALL

  SELECT 'lesson', lesson_id, COUNT(*)::int
  FROM   vw_question_ancestry
  WHERE  lesson_id IS NOT NULL
  GROUP  BY lesson_id
`);
