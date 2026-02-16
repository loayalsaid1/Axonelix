import { relations } from "drizzle-orm/relations";
import { modules, subjects, oldExams, universities, chapters, lessons, questions, questionOptions } from "./schema";

export const subjectsRelations = relations(subjects, ({one, many}) => ({
	module: one(modules, {
		fields: [subjects.moduleId],
		references: [modules.id]
	}),
	chapters: many(chapters),
}));

export const modulesRelations = relations(modules, ({many}) => ({
	subjects: many(subjects),
	oldExams: many(oldExams),
}));

export const oldExamsRelations = relations(oldExams, ({one, many}) => ({
	module: one(modules, {
		fields: [oldExams.moduleId],
		references: [modules.id]
	}),
	university: one(universities, {
		fields: [oldExams.universityId],
		references: [universities.id]
	}),
	questions: many(questions),
}));

export const universitiesRelations = relations(universities, ({many}) => ({
	oldExams: many(oldExams),
}));

export const chaptersRelations = relations(chapters, ({one, many}) => ({
	subject: one(subjects, {
		fields: [chapters.subjectId],
		references: [subjects.id]
	}),
	lessons: many(lessons),
	questions: many(questions),
}));

export const lessonsRelations = relations(lessons, ({one, many}) => ({
	chapter: one(chapters, {
		fields: [lessons.chapterId],
		references: [chapters.id]
	}),
	questions: many(questions),
}));

export const questionsRelations = relations(questions, ({one, many}) => ({
	lesson: one(lessons, {
		fields: [questions.lessonId],
		references: [lessons.id]
	}),
	chapter: one(chapters, {
		fields: [questions.chapterId],
		references: [chapters.id]
	}),
	oldExam: one(oldExams, {
		fields: [questions.oldExamId],
		references: [oldExams.id]
	}),
	questionOptions: many(questionOptions),
}));

export const questionOptionsRelations = relations(questionOptions, ({one}) => ({
	question: one(questions, {
		fields: [questionOptions.questionId],
		references: [questions.id]
	}),
}));