import { relations } from "drizzle-orm/relations";
import {
	modules,
	subjects,
	oldExams,
	universities,
	chapters,
	lessons,
	questions,
	questionOptions,
	users,
	quizzes,
	quizQuestions,
	quizSessions,
	quizSessionAnswers,
	studyStreaks,
	questionReferences,
	userModuleAccess,
	modulePaymentRequests,
	modulePaymentRequestEvents,
	images,
	plannerTasks,
} from "./schema";

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
	module: one(modules, {
		fields: [subjects.moduleId],
		references: [modules.id]
	}),
	chapters: many(chapters),
}));

export const modulesRelations = relations(modules, ({ many }) => ({
	subjects: many(subjects),
	oldExams: many(oldExams),
	userModuleAccess: many(userModuleAccess),
	paymentRequests: many(modulePaymentRequests),
}));

export const oldExamsRelations = relations(oldExams, ({ one, many }) => ({
	module: one(modules, {
		fields: [oldExams.moduleId],
		references: [modules.id]
	}),
	university: one(universities, {
		fields: [oldExams.universityId],
		references: [universities.id]
	}),
	questions: many(questions),
	quizzes: many(quizzes),
}));

export const universitiesRelations = relations(universities, ({ many }) => ({
	oldExams: many(oldExams),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
	subject: one(subjects, {
		fields: [chapters.subjectId],
		references: [subjects.id]
	}),
	lessons: many(lessons),
	questions: many(questions),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
	chapter: one(chapters, {
		fields: [lessons.chapterId],
		references: [chapters.id]
	}),
	questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
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
	reference: one(questionReferences, {
		fields: [questions.referenceId],
		references: [questionReferences.id]
	}),
	questionOptions: many(questionOptions),
	quizQuestions: many(quizQuestions),
	quizSessionAnswers: many(quizSessionAnswers),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one, many }) => ({
	question: one(questions, {
		fields: [questionOptions.questionId],
		references: [questions.id]
	}),
	quizSessionAnswers: many(quizSessionAnswers),
}));

// ─── Quiz Relations ───────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
	quizzes: many(quizzes),
	quizSessions: many(quizSessions),
	moduleAccess: many(userModuleAccess, {
		relationName: 'userAccessOwner',
	}),
	grantedModuleAccess: many(userModuleAccess, {
		relationName: 'userAccessGranter',
	}),
	paymentRequests: many(modulePaymentRequests, {
		relationName: 'paymentRequestOwner',
	}),
	reviewedPaymentRequests: many(modulePaymentRequests, {
		relationName: 'paymentRequestReviewer',
	}),
	paymentRequestEvents: many(modulePaymentRequestEvents),
	plannerTasks: many(plannerTasks),
	studyStreak: one(studyStreaks, {
		fields: [users.id],
		references: [studyStreaks.userId],
	}),
}));

export const userModuleAccessRelations = relations(userModuleAccess, ({ one }) => ({
	user: one(users, {
		fields: [userModuleAccess.userId],
		references: [users.id],
		relationName: 'userAccessOwner',
	}),
	module: one(modules, {
		fields: [userModuleAccess.moduleId],
		references: [modules.id],
	}),
	grantedByUser: one(users, {
		fields: [userModuleAccess.grantedBy],
		references: [users.id],
		relationName: 'userAccessGranter',
	}),
}));

export const modulePaymentRequestsRelations = relations(modulePaymentRequests, ({ one, many }) => ({
	user: one(users, {
		fields: [modulePaymentRequests.userId],
		references: [users.id],
		relationName: 'paymentRequestOwner',
	}),
	module: one(modules, {
		fields: [modulePaymentRequests.moduleId],
		references: [modules.id],
	}),
	proofImage: one(images, {
		fields: [modulePaymentRequests.proofImageId],
		references: [images.id],
	}),
	reviewedByUser: one(users, {
		fields: [modulePaymentRequests.reviewedBy],
		references: [users.id],
		relationName: 'paymentRequestReviewer',
	}),
	events: many(modulePaymentRequestEvents),
}));

export const modulePaymentRequestEventsRelations = relations(modulePaymentRequestEvents, ({ one }) => ({
	paymentRequest: one(modulePaymentRequests, {
		fields: [modulePaymentRequestEvents.paymentRequestId],
		references: [modulePaymentRequests.id],
	}),
	actorUser: one(users, {
		fields: [modulePaymentRequestEvents.actorUserId],
		references: [users.id],
	}),
}));

export const plannerTasksRelations = relations(plannerTasks, ({ one }) => ({
	user: one(users, {
		fields: [plannerTasks.userId],
		references: [users.id],
	}),
}));

export const imagesRelations = relations(images, ({ many }) => ({
	paymentProofRequests: many(modulePaymentRequests),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [quizzes.createdBy],
		references: [users.id],
	}),
	oldExam: one(oldExams, {
		fields: [quizzes.oldExamId],
		references: [oldExams.id],
	}),
	quizQuestions: many(quizQuestions),
	quizSessions: many(quizSessions),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
	quiz: one(quizzes, {
		fields: [quizQuestions.quizId],
		references: [quizzes.id],
	}),
	question: one(questions, {
		fields: [quizQuestions.questionId],
		references: [questions.id],
	}),
}));

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
	quiz: one(quizzes, {
		fields: [quizSessions.quizId],
		references: [quizzes.id],
	}),
	user: one(users, {
		fields: [quizSessions.userId],
		references: [users.id],
	}),
	quizSessionAnswers: many(quizSessionAnswers),
}));

export const quizSessionAnswersRelations = relations(quizSessionAnswers, ({ one }) => ({
	session: one(quizSessions, {
		fields: [quizSessionAnswers.sessionId],
		references: [quizSessions.id],
	}),
	question: one(questions, {
		fields: [quizSessionAnswers.questionId],
		references: [questions.id],
	}),
	selectedOption: one(questionOptions, {
		fields: [quizSessionAnswers.selectedOptionId],
		references: [questionOptions.id],
	}),
}));

export const studyStreaksRelations = relations(studyStreaks, ({ one }) => ({
	user: one(users, {
		fields: [studyStreaks.userId],
		references: [users.id],
	}),
}));
