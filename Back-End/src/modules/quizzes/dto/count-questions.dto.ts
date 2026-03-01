import { OmitType } from '@nestjs/mapped-types';
import { GenerateQuizDto } from './generate-quiz.dto';

/**
 * Query-parameter shape for GET /quizzes/count.
 *
 * Identical to GenerateQuizDto but without `title` and `questionCount` —
 * those fields are irrelevant when just counting available questions.
 *
 * All remaining fields mirror the scope + status filters from GenerateQuizDto:
 *  • moduleIds, moduleType, subjectIds, chapterIds, lessonIds, isMisc
 *  • oldExamId
 *  • questionType
 *  • questionStatus  ('all' | 'incorrect_only' | 'unread')
 */
export class CountQuestionsDto extends OmitType(GenerateQuizDto, [
  'title',
  'questionCount',
] as const) {}
