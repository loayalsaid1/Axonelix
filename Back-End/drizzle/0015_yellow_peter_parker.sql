CREATE TABLE "planner_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"notes" text,
	"due_date" date NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "planner_tasks" ADD CONSTRAINT "planner_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_planner_tasks_user_due_date" ON "planner_tasks" USING btree ("user_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_planner_tasks_user_is_completed" ON "planner_tasks" USING btree ("user_id","is_completed");