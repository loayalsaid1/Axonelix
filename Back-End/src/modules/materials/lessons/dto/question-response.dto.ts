import { QuestionOptionResponseDto } from './question-option-response.dto';

export class QuestionResponseDto {
  id!: number;
  questionType!: string;
  statement!: string;
  statementFormat?: string | null;
  explanation?: unknown | null;
  isMisc!: boolean;
  questionOptions!: QuestionOptionResponseDto[];
}
