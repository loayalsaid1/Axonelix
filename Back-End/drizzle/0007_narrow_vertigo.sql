ALTER TABLE "old_exams" DROP CONSTRAINT "old_exams_module_id_fkey";
--> statement-breakpoint
ALTER TABLE "old_exams" DROP CONSTRAINT "old_exams_university_id_fkey";
--> statement-breakpoint
ALTER TABLE "old_exams" ADD CONSTRAINT "old_exams_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "old_exams" ADD CONSTRAINT "old_exams_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE set null ON UPDATE no action;