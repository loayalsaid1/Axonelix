import { QuestionResponseDto } from './question-response.dto';

export class PaginatedQuestionsDto {
  data!: QuestionResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class QuestionIdsDto {
  ids!: number[];
  total!: number;
}
