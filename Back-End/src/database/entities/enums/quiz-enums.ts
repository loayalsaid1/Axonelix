import { pgEnum } from 'drizzle-orm/pg-core';

// Used in: quizzes.questionType
export const quizQuestionTypeEnum = pgEnum('quiz_question_type', [
  'mcq',
  'written',
  'mixed',
]);

// Used in: quizzes.questionStatus
export const quizQuestionStatusEnum = pgEnum('quiz_question_status', [
  'all',
  'incorrect_only',
  'unread',
]);

// Used in: quiz_sessions.status
export const quizSessionStatusEnum = pgEnum('quiz_session_status', [
  'not_started',
  'in_progress',
  'suspended',
  'completed',
]);
