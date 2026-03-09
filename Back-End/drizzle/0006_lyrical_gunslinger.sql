CREATE TABLE "user_question_status" (
	"user_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"last_is_correct" boolean,
	"attempt_count" integer DEFAULT 1 NOT NULL,
	"last_answered_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_question_status_user_id_question_id_pk" PRIMARY KEY("user_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "user_question_status" ADD CONSTRAINT "user_question_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_status" ADD CONSTRAINT "user_question_status_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_question_status_user_correct" ON "user_question_status" USING btree ("user_id","last_is_correct");--> statement-breakpoint
CREATE VIEW "public"."vw_question_ancestry" AS (select "questions"."id", "questions"."question_type", "questions"."is_misc", "questions"."old_exam_id", "questions"."lesson_id", COALESCE("questions"."chapter_id", "lessons"."chapter_id") as "chapter_id", "chapters"."subject_id", "subjects"."type", "subjects"."module_id" from "questions" left join "lessons" on "lessons"."id" = "questions"."lesson_id" left join "chapters" on "chapters"."id" = COALESCE("questions"."chapter_id", "lessons"."chapter_id") left join "subjects" on "subjects"."id" = "chapters"."subject_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."vw_question_counts" AS (
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
);