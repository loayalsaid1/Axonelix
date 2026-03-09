import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { quizSessions } from './quiz-sessions';
import { questions } from './questions';
import { questionOptions } from './question-options';

export const quizSessionAnswers = pgTable(
  'quiz_session_answers',
  {
    id: serial().primaryKey(),

    sessionId: integer('session_id')
      .notNull()
      .references(() => quizSessions.id, { onDelete: 'cascade' }),
    questionId: integer('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),

    // MCQ: foreign key to the chosen option
    selectedOptionId: integer('selected_option_id').references(
      () => questionOptions.id,
      { onDelete: 'set null' },
    ),

    // Written questions: free-text answer
    writtenAnswer: text('written_answer'),

    isCorrect: boolean('is_correct'),
    isMarked: boolean('is_marked').notNull().default(false),
    isEliminated: boolean('is_eliminated').notNull().default(false),

    answeredAt: timestamp('answered_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    unique('quiz_session_answers_session_question_unique').on(
      table.sessionId,
      table.questionId,
    ),
    index('idx_quiz_session_answers_session').on(table.sessionId),
    index('idx_quiz_session_answers_question').on(table.questionId),
  ],
);
