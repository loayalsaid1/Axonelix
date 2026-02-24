import { QuestionResponseDto } from './question-response.dto';

export class PaginatedQuestionsDto {
  data!: QuestionResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
