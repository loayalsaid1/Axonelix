-- =============================================================================
-- CUSTOM MIGRATION: Quiz Triggers & Views
-- =============================================================================
-- This migration adds database-level logic that I cannot express directly
-- in Drizzle ORM entity definitions.  It should be run AFTER migration 0003.
--
-- Sections:
--   1. quiz_questions sync trigger     (keeps quizzes.question_ids / total_questions in sync)
--   2. View: v_latest_user_question_status  (used for "incorrect_only" / "unread" filters)
--   3. View: v_user_subject_accuracy        (used for analytics dashboard)
-- =============================================================================


-- =============================================================================
-- 1. QUIZ QUESTIONS SYNC TRIGGER
--
-- Context (see also: src/database/entities/quizzes.ts)
-- -------------------------------------------------------
-- quizzes.question_ids  (integer[]) and quizzes.total_questions are denormalised
-- aggregates kept in sync by this trigger.  They are NEVER written by application
-- code – only this trigger manages them.
--
-- Fires: AFTER INSERT | UPDATE | DELETE on quiz_questions (FOR EACH ROW)
-- Effect: re-aggregates all question_id values for the affected quiz and writes
--         the result back into quizzes.question_ids / quizzes.total_questions.
-- =============================================================================

CREATE OR REPLACE FUNCTION sync_quiz_question_ids()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_quiz_id integer := COALESCE(NEW.quiz_id, OLD.quiz_id);
BEGIN
    UPDATE quizzes
    SET
        question_ids    = (
            SELECT COALESCE(array_agg(question_id ORDER BY question_id), ARRAY[]::integer[])
            FROM   quiz_questions
            WHERE  quiz_id = v_quiz_id
        )
    WHERE id = v_quiz_id;

    RETURN NULL;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER trg_sync_quiz_question_ids
AFTER INSERT OR UPDATE OR DELETE ON quiz_questions
FOR EACH ROW EXECUTE FUNCTION sync_quiz_question_ids();
--> statement-breakpoint


-- =============================================================================
-- 3. VIEW: v_latest_user_question_status
--
-- Purpose: For each (user, question) pair, returns the most recent completed
--          attempt result.  Used by the test-generation logic to implement the
--          "incorrect_only" and "unread" question-status filters.
--
-- Columns:
--   user_id           – the student
--   question_id       – the question
--   last_is_correct   – true / false / NULL (written questions not yet graded)
--   last_answered_at  – timestamp of that attempt
-- =============================================================================

CREATE OR REPLACE VIEW v_latest_user_question_status AS
SELECT DISTINCT ON (qs.user_id, qsa.question_id)
    qs.user_id,
    qsa.question_id,
    qsa.is_correct      AS last_is_correct,
    qsa.answered_at     AS last_answered_at
FROM  quiz_session_answers  qsa
JOIN  quiz_sessions         qs ON qs.id = qsa.session_id
WHERE qs.status = 'completed'
ORDER BY qs.user_id, qsa.question_id, qsa.answered_at DESC;
--> statement-breakpoint


-- =============================================================================
-- 4. VIEW: v_user_subject_accuracy
--
-- Purpose: Aggregated accuracy per user broken down by chapter and lesson.
--          Feeds the Performance / Analytics dashboard screens.
--
-- Columns:
--   user_id       – the student
--   chapter_id    – may be NULL for old-exam-only questions
--   lesson_id     – may be NULL for chapter-level or old-exam questions
--   total_attempts
--   correct_count
--   accuracy_pct  – 0–100 rounded to 2 d.p.
-- =============================================================================

CREATE OR REPLACE VIEW v_user_subject_accuracy AS
SELECT
    qs.user_id,
    q.chapter_id,
    q.lesson_id,
    COUNT(*)                                           AS total_attempts,
    COUNT(*) FILTER (WHERE qsa.is_correct = true)      AS correct_count,
    ROUND(
        COUNT(*) FILTER (WHERE qsa.is_correct = true)::numeric
        / NULLIF(COUNT(*), 0) * 100,
        2
    )                                                  AS accuracy_pct
FROM  quiz_session_answers  qsa
JOIN  quiz_sessions         qs ON qs.id  = qsa.session_id
JOIN  questions             q  ON q.id   = qsa.question_id
WHERE qs.status = 'completed'
GROUP BY qs.user_id, q.chapter_id, q.lesson_id;
