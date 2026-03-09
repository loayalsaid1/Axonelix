import { questionOptions } from '../../../../database/entities/question-options';

type OptionInsert = typeof questionOptions.$inferInsert;
type OptionRow = typeof questionOptions.$inferSelect;

export class QuestionOptionDto {
  optionText!: OptionInsert['optionText'];
  isCorrect!: OptionInsert['isCorrect'];
}

export class QuestionOptionResponseDto {
  id!: OptionRow['id'];
  questionId!: OptionRow['questionId'];
  optionText!: OptionRow['optionText'];
  isCorrect!: OptionRow['isCorrect'];
}
