import { pgTable, text, timestamp, uuid, varchar, pgEnum, index, integer } from "drizzle-orm/pg-core"
import { users } from "./users"
import { sql } from "drizzle-orm"

export const imageStatusEnum = pgEnum("image_status", ["pending", "committed", "deleted"])
export const imageEntityTypeEnum = pgEnum("image_entity_type", ["lesson", "question", "explanation"])

export const images = pgTable("images", {
	id: uuid("id").primaryKey().defaultRandom(),
	url: text("url").notNull(),
	imagekitFileId: varchar("imagekit_file_id", { length: 255 }).notNull(),
	entityType: imageEntityTypeEnum("entity_type"),
	entityId: integer("entity_id"),
	uploadedBy: integer("uploaded_by")
		.references(() => users.id, { onDelete: "set null" }),
	status: imageStatusEnum("status").default("pending").notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { mode: "string" })
}, (table) => [
	index("images_entity_idx").on(table.entityType, table.entityId),
	index("images_url_idx").on(table.url),
	index("images_status_created_at_idx").on(table.status, table.createdAt),
	index("images_status_updated_at_idx").on(table.status, table.updatedAt),
])
