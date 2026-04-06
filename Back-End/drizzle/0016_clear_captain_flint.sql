CREATE TYPE "public"."deck_type" AS ENUM('ADMIN', 'PERSONAL');--> statement-breakpoint
CREATE TABLE "flashcard_decks" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"user_id" integer,
	"deck_type" "deck_type" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"card_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" serial PRIMARY KEY NOT NULL,
	"deck_id" integer NOT NULL,
	"front" text NOT NULL,
	"back" text NOT NULL,
	"order" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_flashcard_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."flashcard_decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_flashcard_decks_admin_lesson" ON "flashcard_decks" USING btree ("lesson_id") WHERE "flashcard_decks"."deck_type" = 'ADMIN';--> statement-breakpoint
CREATE UNIQUE INDEX "idx_flashcard_decks_personal_lesson_user" ON "flashcard_decks" USING btree ("lesson_id","user_id") WHERE "flashcard_decks"."deck_type" = 'PERSONAL';--> statement-breakpoint
CREATE INDEX "idx_flashcards_deck_id" ON "flashcards" USING btree ("deck_id");