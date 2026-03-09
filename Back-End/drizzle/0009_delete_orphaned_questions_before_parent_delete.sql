-- Custom SQL migration file, put your code below!
CREATE OR REPLACE FUNCTION delete_orphaned_question()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.lesson_id IS NULL AND NEW.chapter_id IS NULL AND NEW.old_exam_id IS NULL THEN
        DELETE FROM questions WHERE id = NEW.id;
        RETURN NULL; -- cancel the UPDATE; row already gone
    END IF;
    RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS trg_delete_orphaned_question ON questions;
--> statement-breakpoint

CREATE TRIGGER trg_delete_orphaned_question
BEFORE UPDATE OF lesson_id, chapter_id, old_exam_id ON questions
FOR EACH ROW
EXECUTE FUNCTION delete_orphaned_question();
