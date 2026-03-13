CREATE TABLE "question_references" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "question_references_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "reference_id" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_reference_id_fkey" FOREIGN KEY ("reference_id") REFERENCES "public"."question_references"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_questions_reference" ON "questions" USING btree ("reference_id" int4_ops) WHERE (reference_id IS NOT NULL);