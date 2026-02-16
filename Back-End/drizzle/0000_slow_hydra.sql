-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"order_index" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"description" text,
	"order_index" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "subjects_type_check" CHECK ((type)::text = ANY ((ARRAY['theoretical'::character varying, 'practical'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "universities_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "old_exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"exam_type" varchar(20) NOT NULL,
	"module_id" integer NOT NULL,
	"module_type" varchar(20) NOT NULL,
	"university_id" integer NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "old_exams_exam_type_module_id_module_type_university_id_yea_key" UNIQUE("exam_type","module_id","module_type","university_id","year"),
	CONSTRAINT "old_exams_exam_type_check" CHECK ((exam_type)::text = ANY ((ARRAY['final'::character varying, 'midterm'::character varying, 'tpl'::character varying, 'flipped'::character varying])::text[])),
	CONSTRAINT "old_exams_module_type_check" CHECK ((module_type)::text = ANY ((ARRAY['theoretical'::character varying, 'practical'::character varying])::text[])),
	CONSTRAINT "old_exams_year_check" CHECK ((year >= 2000) AND (year <= 2100))
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_miscellaneous" boolean DEFAULT false,
	"order_index" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"content" jsonb,
	"order_index" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_type" varchar(20) NOT NULL,
	"statement" text NOT NULL,
	"statement_format" varchar(20) DEFAULT 'text',
	"explanation" jsonb,
	"lesson_id" integer,
	"chapter_id" integer,
	"is_misc" boolean DEFAULT false,
	"old_exam_id" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "questions_question_type_check" CHECK ((question_type)::text = ANY ((ARRAY['mcq'::character varying, 'written'::character varying])::text[])),
	CONSTRAINT "questions_statement_format_check" CHECK ((statement_format)::text = ANY ((ARRAY['text'::character varying, 'tiptap_json'::character varying])::text[])),
	CONSTRAINT "questions_check" CHECK ((lesson_id IS NOT NULL) OR (chapter_id IS NOT NULL) OR (old_exam_id IS NOT NULL)),
	CONSTRAINT "questions_check1" CHECK (((lesson_id IS NOT NULL) AND (is_misc = false)) OR (lesson_id IS NULL))
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "old_exams" ADD CONSTRAINT "old_exams_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "old_exams" ADD CONSTRAINT "old_exams_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_old_exam_id_fkey" FOREIGN KEY ("old_exam_id") REFERENCES "public"."old_exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_subjects_module" ON "subjects" USING btree ("module_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_old_exams_lookup" ON "old_exams" USING btree ("university_id" int4_ops,"year" int4_ops,"exam_type" text_ops,"module_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_chapters_misc" ON "chapters" USING btree ("is_miscellaneous" bool_ops) WHERE (is_miscellaneous = true);--> statement-breakpoint
CREATE INDEX "idx_chapters_subject" ON "chapters" USING btree ("subject_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_lessons_chapter" ON "lessons" USING btree ("chapter_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_questions_chapter" ON "questions" USING btree ("chapter_id" int4_ops) WHERE (chapter_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_questions_lesson" ON "questions" USING btree ("lesson_id" int4_ops) WHERE (lesson_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_questions_misc" ON "questions" USING btree ("is_misc" bool_ops) WHERE (is_misc = true);--> statement-breakpoint
CREATE INDEX "idx_questions_old_exam" ON "questions" USING btree ("old_exam_id" int4_ops) WHERE (old_exam_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_questions_type" ON "questions" USING btree ("question_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_question_options_correct" ON "question_options" USING btree ("question_id" int4_ops,"is_correct" bool_ops) WHERE (is_correct = true);--> statement-breakpoint
CREATE INDEX "idx_question_options_question" ON "question_options" USING btree ("question_id" int4_ops);
