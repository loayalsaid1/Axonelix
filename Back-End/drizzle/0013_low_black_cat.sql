CREATE TYPE "public"."image_entity_type" AS ENUM('lesson', 'question', 'explanation');--> statement-breakpoint
CREATE TYPE "public"."image_status" AS ENUM('pending', 'committed', 'deleted');--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"imagekit_file_id" varchar(255) NOT NULL,
	"entity_type" "image_entity_type",
	"entity_id" integer,
	"uploaded_by" integer,
	"status" "image_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "images_entity_idx" ON "images" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "images_url_idx" ON "images" USING btree ("url");--> statement-breakpoint
CREATE INDEX "images_status_created_at_idx" ON "images" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "images_status_updated_at_idx" ON "images" USING btree ("status","updated_at");