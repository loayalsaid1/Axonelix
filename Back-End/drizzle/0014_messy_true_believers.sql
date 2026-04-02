CREATE TYPE "public"."payment_request_status" AS ENUM('pending', 'approved', 'rejected', 'canceled');--> statement-breakpoint
ALTER TYPE "public"."image_entity_type" ADD VALUE 'payment_proof';--> statement-breakpoint
CREATE TABLE "module_payment_request_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_request_id" integer NOT NULL,
	"from_status" "payment_request_status",
	"to_status" "payment_request_status" NOT NULL,
	"actor_user_id" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_payment_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"status" "payment_request_status" DEFAULT 'pending' NOT NULL,
	"proof_image_id" uuid,
	"submit_note" text,
	"review_note" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"module_fee_piasters" integer DEFAULT 20000 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_module_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"source" varchar(50) DEFAULT 'manual_payment' NOT NULL,
	"granted_by" integer,
	"granted_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "module_payment_request_events" ADD CONSTRAINT "module_payment_request_events_request_id_fkey" FOREIGN KEY ("payment_request_id") REFERENCES "public"."module_payment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_payment_request_events" ADD CONSTRAINT "module_payment_request_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_payment_requests" ADD CONSTRAINT "module_payment_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_payment_requests" ADD CONSTRAINT "module_payment_requests_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_payment_requests" ADD CONSTRAINT "module_payment_requests_proof_image_id_fkey" FOREIGN KEY ("proof_image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_payment_requests" ADD CONSTRAINT "module_payment_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_access" ADD CONSTRAINT "user_module_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_access" ADD CONSTRAINT "user_module_access_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_access" ADD CONSTRAINT "user_module_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_module_payment_request_events_request" ON "module_payment_request_events" USING btree ("payment_request_id");--> statement-breakpoint
CREATE INDEX "idx_module_payment_requests_status" ON "module_payment_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_module_payment_requests_user" ON "module_payment_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_module_payment_requests_module" ON "module_payment_requests" USING btree ("module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_module_payment_requests_pending_user_module" ON "module_payment_requests" USING btree ("user_id","module_id") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "idx_user_module_access_module_user" ON "user_module_access" USING btree ("module_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_user_module_access_user" ON "user_module_access" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_module_access_active" ON "user_module_access" USING btree ("user_id","module_id") WHERE revoked_at IS NULL;