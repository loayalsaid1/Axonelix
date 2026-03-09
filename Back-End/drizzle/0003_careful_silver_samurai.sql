CREATE TYPE "public"."quiz_question_status" AS ENUM('all', 'incorrect_only', 'unread');--> statement-breakpoint
CREATE TYPE "public"."quiz_question_type" AS ENUM('mcq', 'written', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."quiz_session_status" AS ENUM('not_started', 'in_progress', 'suspended', 'completed');--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"quiz_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	CONSTRAINT "quiz_questions_quiz_id_question_id_pk" PRIMARY KEY("quiz_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_session_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"selected_option_id" integer,
	"written_answer" text,
	"is_correct" boolean,
	"is_marked" boolean DEFAULT false NOT NULL,
	"is_eliminated" boolean DEFAULT false NOT NULL,
	"answered_at" timestamp DEFAULT now(),
	CONSTRAINT "quiz_session_answers_session_question_unique" UNIQUE("session_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" "quiz_session_status" DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"time_taken_secs" integer,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"score_pct" numeric(5, 2),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"created_by" integer NOT NULL,
	"old_exam_id" integer,
	"scope_filter" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"question_type" "quiz_question_type",
	"question_status" "quiz_question_status",
	"question_ids" integer[] DEFAULT ARRAY[]::integer[] NOT NULL,
	"total_questions" integer GENERATED ALWAYS AS (COALESCE(array_length(question_ids, 1), 0)) STORED,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_answers" ADD CONSTRAINT "quiz_session_answers_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_answers" ADD CONSTRAINT "quiz_session_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_answers" ADD CONSTRAINT "quiz_session_answers_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_old_exam_id_old_exams_id_fk" FOREIGN KEY ("old_exam_id") REFERENCES "public"."old_exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_quiz" ON "quiz_questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_qid" ON "quiz_questions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_session_answers_session" ON "quiz_session_answers" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_session_answers_question" ON "quiz_session_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_user" ON "quiz_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_quiz" ON "quiz_sessions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "idx_quiz_sessions_status" ON "quiz_sessions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_quizzes_created_by" ON "quizzes" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_quizzes_old_exam" ON "quizzes" USING btree ("old_exam_id") WHERE old_exam_id IS NOT NULL;