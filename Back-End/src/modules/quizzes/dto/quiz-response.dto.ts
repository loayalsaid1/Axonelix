import { quizzes } from '../../../database/entities/quizzes';
import { questions } from '../../../database/entities/questions';
import { questionOptions } from '../../../database/entities/question-options';

type QuizRow = typeof quizzes.$inferSelect;
type QuestionRow = typeof questions.$inferSelect;
type OptionRow = typeof questionOptions.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────

export class QuizOptionResponseDto {
  id!: OptionRow['id'];
  optionText!: OptionRow['optionText'];
  isCorrect!: OptionRow['isCorrect'];
}

export class QuizQuestionResponseDto {
  id!: QuestionRow['id'];
  questionType!: QuestionRow['questionType'];
  statement!: QuestionRow['statement'];
  statementFormat!: QuestionRow['statementFormat'];
  explanation!: QuestionRow['explanation'];
  lessonId!: QuestionRow['lessonId'];
  chapterId!: QuestionRow['chapterId'];
  isMisc!: QuestionRow['isMisc'];
  oldExamId!: QuestionRow['oldExamId'];
  createdAt!: QuestionRow['createdAt'];
  updatedAt!: QuestionRow['updatedAt'];
  questionOptions!: QuizOptionResponseDto[];
}

/**
 * Compact quiz shape returned in the paginated quiz list and as the embedded
 * quiz on session-list items.  Does NOT include `createdBy` (internal user
 * ID) or fully-populated questions.
 */
export class QuizSummaryResponseDto {
  id!: QuizRow['id'];
  title!: QuizRow['title'];
  questionType!: QuizRow['questionType'];
  questionStatus!: QuizRow['questionStatus'];
  totalQuestions!: QuizRow['totalQuestions'];
  scopeFilter!: QuizRow['scopeFilter'];
  createdAt!: QuizRow['createdAt'];
}

/**
 * Full quiz detail returned by GET /quizzes/:id, POST /quizzes (generate),
 * and embedded in session-detail responses.  Extends the summary with the
 * additional columns needed to hydrate the test page.
 */
export class QuizDetailResponseDto extends QuizSummaryResponseDto {
  description!: QuizRow['description'];
  oldExamId!: QuizRow['oldExamId'];
  questionIds!: QuizRow['questionIds'];
  updatedAt!: QuizRow['updatedAt'];
  questions!: QuizQuestionResponseDto[];
}

export class PaginatedQuizzesDto {
  data!: QuizSummaryResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
