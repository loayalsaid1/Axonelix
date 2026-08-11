import { pgTable, serial, varchar, text, integer, timestamp, index, foreignKey, check, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { lessons } from "./lessons";
import { chapters } from "./chapters";
import { oldExams } from "./old-exams";
import { questionReferences } from "./question-references";

export const questions = pgTable("questions", {
	id: serial().primaryKey().notNull(),
	questionType: varchar("question_type", { length: 20 }).notNull(),
	statement: text().notNull(),
	statementFormat: varchar("statement_format", { length: 20 }).default('text'),
	explanation: jsonb(),
	explanationIsLegacyFormat: boolean("explanation_is_legacy_format").default(false).notNull(),
	lessonId: integer("lesson_id"),
	chapterId: integer("chapter_id"),
	isMisc: boolean("is_misc").default(false),
	oldExamId: integer("old_exam_id"),
	referenceId: integer("reference_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_questions_chapter").using("btree", table.chapterId.asc().nullsLast().op("int4_ops")).where(sql`(chapter_id IS NOT NULL)`),
	index("idx_questions_lesson").using("btree", table.lessonId.asc().nullsLast().op("int4_ops")).where(sql`(lesson_id IS NOT NULL)`),
	index("idx_questions_misc").using("btree", table.isMisc.asc().nullsLast().op("bool_ops")).where(sql`(is_misc = true)`),
	index("idx_questions_old_exam").using("btree", table.oldExamId.asc().nullsLast().op("int4_ops")).where(sql`(old_exam_id IS NOT NULL)`),
	index("idx_questions_reference").using("btree", table.referenceId.asc().nullsLast().op("int4_ops")).where(sql`(reference_id IS NOT NULL)`),
	index("idx_questions_type").using("btree", table.questionType.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.lessonId],
		foreignColumns: [lessons.id],
		name: "questions_lesson_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.chapterId],
		foreignColumns: [chapters.id],
		name: "questions_chapter_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.oldExamId],
		foreignColumns: [oldExams.id],
		name: "questions_old_exam_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.referenceId],
		foreignColumns: [questionReferences.id],
		name: "questions_reference_id_fkey"
	}).onDelete("set null"),
	check("questions_question_type_check", sql`(question_type)::text = ANY ((ARRAY['mcq'::character varying, 'written'::character varying])::text[])`),
	check("questions_statement_format_check", sql`(statement_format)::text = ANY ((ARRAY['text'::character varying, 'tiptap_json'::character varying])::text[])`),
	check("questions_check", sql`(lesson_id IS NOT NULL) OR (chapter_id IS NOT NULL) OR (old_exam_id IS NOT NULL)`),
	check("questions_check1", sql`((lesson_id IS NOT NULL) AND (is_misc = false)) OR (lesson_id IS NULL)`),
]);
