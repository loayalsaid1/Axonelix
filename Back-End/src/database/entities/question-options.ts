import { pgTable, serial, text, integer, timestamp, index, foreignKey, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { questions } from "./questions";

export const questionOptions = pgTable("question_options", {
	id: serial().primaryKey().notNull(),
	questionId: integer("question_id").notNull(),
	optionText: text("option_text").notNull(),
	isCorrect: boolean("is_correct").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_question_options_correct").using("btree", table.questionId.asc().nullsLast().op("int4_ops"), table.isCorrect.asc().nullsLast().op("bool_ops")).where(sql`(is_correct = true)`),
	index("idx_question_options_question").using("btree", table.questionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questions.id],
			name: "question_options_question_id_fkey"
		}).onDelete("cascade"),
]);
