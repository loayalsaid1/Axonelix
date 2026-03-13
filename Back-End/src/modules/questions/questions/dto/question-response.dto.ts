import { questions } from '../../../../database/entities/questions';
import { questionOptions } from '../../../../database/entities/question-options';
import { questionReferences } from 'src/database/schema';

type QuestionRow = typeof questions.$inferSelect;
type OptionRow = typeof questionOptions.$inferSelect;
type ReferenceRow = typeof questionReferences.$inferSelect;

export class QuestionOptionResponseDto {
  id!: OptionRow['id'];
  optionText!: OptionRow['optionText'];
  isCorrect!: OptionRow['isCorrect'];
}

export class QuestionResponseDto {
  id!: QuestionRow['id'];
  questionType!: QuestionRow['questionType'];
  statement!: QuestionRow['statement'];
  statementFormat!: QuestionRow['statementFormat'];
  explanation!: QuestionRow['explanation'];
  lessonId!: QuestionRow['lessonId'];
  chapterId!: QuestionRow['chapterId'];
  isMisc!: QuestionRow['isMisc'];
  oldExamId!: QuestionRow['oldExamId'];
  referenceId!: QuestionRow['referenceId'];
  referenceName?: ReferenceRow['name'];
  createdAt!: QuestionRow['createdAt'];
  updatedAt!: QuestionRow['updatedAt'];
  questionOptions!: QuestionOptionResponseDto[];
}
