import { pgTable, serial, varchar, text, integer, timestamp, index, foreignKey, check, unique, boolean, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const modules = pgTable("modules", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	orderIndex: integer("order_index"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const subjects = pgTable("subjects", {
	id: serial().primaryKey().notNull(),
	moduleId: integer("module_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	description: text(),
	orderIndex: integer("order_index"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_subjects_module").using("btree", table.moduleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "subjects_module_id_fkey"
		}).onDelete("cascade"),
	check("subjects_type_check", sql`(type)::text = ANY ((ARRAY['theoretical'::character varying, 'practical'::character varying])::text[])`),
]);

export const universities = pgTable("universities", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("universities_name_key").on(table.name),
]);

export const oldExams = pgTable("old_exams", {
	id: serial().primaryKey().notNull(),
	examType: varchar("exam_type", { length: 20 }).notNull(),
	moduleId: integer("module_id").notNull(),
	moduleType: varchar("module_type", { length: 20 }).notNull(),
	universityId: integer("university_id").notNull(),
	year: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_old_exams_lookup").using("btree", table.universityId.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("text_ops"), table.examType.asc().nullsLast().op("text_ops"), table.moduleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "old_exams_module_id_fkey"
		}),
	foreignKey({
			columns: [table.universityId],
			foreignColumns: [universities.id],
			name: "old_exams_university_id_fkey"
		}),
	unique("old_exams_exam_type_module_id_module_type_university_id_yea_key").on(table.examType, table.moduleId, table.moduleType, table.universityId, table.year),
	check("old_exams_exam_type_check", sql`(exam_type)::text = ANY ((ARRAY['final'::character varying, 'midterm'::character varying, 'tpl'::character varying, 'flipped'::character varying])::text[])`),
	check("old_exams_module_type_check", sql`(module_type)::text = ANY ((ARRAY['theoretical'::character varying, 'practical'::character varying])::text[])`),
	check("old_exams_year_check", sql`(year >= 2000) AND (year <= 2100)`),
]);

export const chapters = pgTable("chapters", {
	id: serial().primaryKey().notNull(),
	subjectId: integer("subject_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	isMiscellaneous: boolean("is_miscellaneous").default(false),
	orderIndex: integer("order_index"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_chapters_misc").using("btree", table.isMiscellaneous.asc().nullsLast().op("bool_ops")).where(sql`(is_miscellaneous = true)`),
	index("idx_chapters_subject").using("btree", table.subjectId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.subjectId],
			foreignColumns: [subjects.id],
			name: "chapters_subject_id_fkey"
		}).onDelete("cascade"),
]);

export const lessons = pgTable("lessons", {
	id: serial().primaryKey().notNull(),
	chapterId: integer("chapter_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	content: jsonb(),
	orderIndex: integer("order_index"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_lessons_chapter").using("btree", table.chapterId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapters.id],
			name: "lessons_chapter_id_fkey"
		}).onDelete("cascade"),
]);

export const questions = pgTable("questions", {
	id: serial().primaryKey().notNull(),
	questionType: varchar("question_type", { length: 20 }).notNull(),
	statement: text().notNull(),
	statementFormat: varchar("statement_format", { length: 20 }).default('text'),
	explanation: jsonb(),
	lessonId: integer("lesson_id"),
	chapterId: integer("chapter_id"),
	isMisc: boolean("is_misc").default(false),
	oldExamId: integer("old_exam_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_questions_chapter").using("btree", table.chapterId.asc().nullsLast().op("int4_ops")).where(sql`(chapter_id IS NOT NULL)`),
	index("idx_questions_lesson").using("btree", table.lessonId.asc().nullsLast().op("int4_ops")).where(sql`(lesson_id IS NOT NULL)`),
	index("idx_questions_misc").using("btree", table.isMisc.asc().nullsLast().op("bool_ops")).where(sql`(is_misc = true)`),
	index("idx_questions_old_exam").using("btree", table.oldExamId.asc().nullsLast().op("int4_ops")).where(sql`(old_exam_id IS NOT NULL)`),
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
	check("questions_question_type_check", sql`(question_type)::text = ANY ((ARRAY['mcq'::character varying, 'written'::character varying])::text[])`),
	check("questions_statement_format_check", sql`(statement_format)::text = ANY ((ARRAY['text'::character varying, 'tiptap_json'::character varying])::text[])`),
	check("questions_check", sql`(lesson_id IS NOT NULL) OR (chapter_id IS NOT NULL) OR (old_exam_id IS NOT NULL)`),
	check("questions_check1", sql`((lesson_id IS NOT NULL) AND (is_misc = false)) OR (lesson_id IS NULL)`),
]);

export const questionOptions = pgTable("question_options", {
	id: serial().primaryKey().notNull(),
	questionId: integer("question_id").notNull(),
	optionText: text("option_text").notNull(),
	isCorrect: boolean("is_correct").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_question_options_correct").using("btree", table.questionId.asc().nullsLast().op("int4_ops"), table.isCorrect.asc().nullsLast().op("int4_ops")).where(sql`(is_correct = true)`),
	index("idx_question_options_question").using("btree", table.questionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "question_options_question_id_fkey"
		}).onDelete("cascade"),
]);
