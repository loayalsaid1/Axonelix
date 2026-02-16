DROP INDEX "idx_old_exams_lookup";--> statement-breakpoint
DROP INDEX "idx_question_options_correct";--> statement-breakpoint
CREATE INDEX "idx_old_exams_lookup" ON "old_exams" USING btree ("university_id" int4_ops,"year" int4_ops,"exam_type" text_ops,"module_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_question_options_correct" ON "question_options" USING btree ("question_id" int4_ops,"is_correct" bool_ops) WHERE (is_correct = true);