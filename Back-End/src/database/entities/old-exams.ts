import { pgTable, serial, varchar, integer, timestamp, index, foreignKey, check, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { modules } from "./modules";
import { universities } from "./universities";

export const oldExams = pgTable("old_exams", {
	id: serial().primaryKey().notNull(),
	examType: varchar("exam_type", { length: 20 }).notNull(),
	moduleId: integer("module_id").notNull(),
	moduleType: varchar("module_type", { length: 20 }).notNull(),
	universityId: integer("university_id").notNull(),
	year: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_old_exams_lookup").using("btree", table.universityId.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops"), table.examType.asc().nullsLast().op("text_ops"), table.moduleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.moduleId],
		foreignColumns: [modules.id],
		name: "old_exams_module_id_fkey"
	}).onDelete('cascade'),
	foreignKey({
		columns: [table.universityId],
		foreignColumns: [universities.id],
		name: "old_exams_university_id_fkey"
	}).onDelete('cascade'),
	unique("old_exams_exam_type_module_id_module_type_university_id_yea_key").on(table.examType, table.moduleId, table.moduleType, table.universityId, table.year),
	check("old_exams_exam_type_check", sql`(exam_type)::text = ANY ((ARRAY['final'::character varying, 'midterm'::character varying, 'tpl'::character varying, 'flipped'::character varying])::text[])`),
	check("old_exams_module_type_check", sql`(module_type)::text = ANY ((ARRAY['theoretical'::character varying, 'practical'::character varying])::text[])`),
	check("old_exams_year_check", sql`(year >= 2000) AND (year <= 2100)`),
]);
