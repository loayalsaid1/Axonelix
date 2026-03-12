import { modules } from "./entities/modules";
import { subjects } from "./entities/subjects";
import { universities } from "./entities/universities";
import { oldExams } from "./entities/old-exams";
import { chapters } from "./entities/chapters";
import { lessons } from "./entities/lessons";
import { questions } from "./entities/questions";
import { questionOptions } from "./entities/question-options";
import { users } from "./entities/users";
import { quizzes } from "./entities/quizzes";
import { quizQuestions } from "./entities/quiz-questions";
import { quizSessions } from "./entities/quiz-sessions";
import { quizSessionAnswers } from "./entities/quiz-session-answers";
import {
	quizQuestionTypeEnum,
	quizQuestionStatusEnum,
	quizSessionStatusEnum,
} from "./entities/enums/quiz-enums";
import { userRoleEnum } from "./entities/enums/user-enums";
import {
	vLatestUserQuestionStatus,
	vUserSubjectAccuracy,
} from "./entities/quiz-views";
import {
	vwQuestionAncestry,
	vwQuestionCounts,
} from "./entities/question-hierarchy-views";
import { userQuestionStatus } from "./entities/user-question-status";
import { studyStreaks } from "./entities/study-streaks";
import * as relations from "./relations";

// This is for Drizzle kit to work
export {
	modules,
	subjects,
	universities,
	oldExams,
	chapters,
	lessons,
	questions,
	questionOptions,
	users,
	quizzes,
	quizQuestions,
	quizSessions,
	quizSessionAnswers,
	quizQuestionTypeEnum,
	quizQuestionStatusEnum,
	quizSessionStatusEnum,
	userRoleEnum,
	vLatestUserQuestionStatus,
	vUserSubjectAccuracy,
	vwQuestionAncestry,
	vwQuestionCounts,
	userQuestionStatus,
	studyStreaks,
};

export const schema = {
	modules,
	subjects,
	universities,
	oldExams,
	chapters,
	lessons,
	questions,
	questionOptions,
	users,
	quizzes,
	quizQuestions,
	quizSessions,
	quizSessionAnswers,
	quizQuestionTypeEnum,
	quizQuestionStatusEnum,
	quizSessionStatusEnum,
	userRoleEnum,
	vLatestUserQuestionStatus,
	vUserSubjectAccuracy,
	vwQuestionAncestry,
	vwQuestionCounts,
	userQuestionStatus,
	studyStreaks,
	...relations,
};

export type Schema = typeof schema;
