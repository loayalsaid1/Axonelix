-- =============================================================================
-- 1. UNIQUE INDEX on vw_question_counts
--
-- Must be created after the materialized view exists (created by the
-- drizzle-kit generated migration that runs before this file).
-- Required for: REFRESH MATERIALIZED VIEW CONCURRENTLY
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_question_counts_type_entity
    ON vw_question_counts (entity_type, entity_id);
--> statement-breakpoint


-- =============================================================================
-- 2. TRIGGER: trg_refresh_question_counts
--
-- Fires AFTER any INSERT / UPDATE / DELETE on questions (per-statement, not
-- per-row — avoids N refreshes for bulk operations).
--
-- Uses CONCURRENTLY so vw_question_counts remains queryable during refresh.
-- The unique index above (section 1) is required for CONCURRENTLY to work.
-- =============================================================================

CREATE OR REPLACE FUNCTION refresh_question_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY vw_question_counts;
    RETURN NULL;
END;
$$;
--> statement-breakpoint

CREATE TRIGGER trg_refresh_question_counts
AFTER INSERT OR UPDATE OR DELETE ON questions
FOR EACH STATEMENT EXECUTE FUNCTION refresh_question_counts();
